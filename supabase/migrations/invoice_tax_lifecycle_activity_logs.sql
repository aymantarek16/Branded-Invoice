-- Invoice lifecycle, tax totals, and activity log migration.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS tax_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_total NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_type TEXT,
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_total NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_total NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grand_total NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.invoice_items
  ALTER COLUMN name DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.invoice_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'issued', 'marked_paid', 'cancelled')),
  old_status TEXT,
  new_status TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')) NOT VALID;

  ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_discount_type_check;
  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_discount_type_check CHECK (discount_type IS NULL OR discount_type IN ('fixed', 'percentage')) NOT VALID;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_tax_rate_non_negative_check' AND conrelid = 'public.invoices'::regclass) THEN
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_tax_rate_non_negative_check CHECK (COALESCE(tax_rate, 0) >= 0) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_totals_non_negative_check' AND conrelid = 'public.invoices'::regclass) THEN
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_totals_non_negative_check CHECK (
      COALESCE(subtotal, 0) >= 0
      AND COALESCE(discount_value, 0) >= 0
      AND COALESCE(discount_total, 0) >= 0
      AND COALESCE(tax_total, 0) >= 0
      AND COALESCE(shipping_total, 0) >= 0
      AND COALESCE(grand_total, 0) >= 0
      AND COALESCE(paid_amount, 0) >= 0
      AND COALESCE(remaining_amount, 0) >= 0
    ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_items_required_text_check' AND conrelid = 'public.invoice_items'::regclass) THEN
    ALTER TABLE public.invoice_items ADD CONSTRAINT invoice_items_required_text_check CHECK (
      NULLIF(BTRIM(COALESCE(name, '')), '') IS NOT NULL
      OR NULLIF(BTRIM(COALESCE(description, '')), '') IS NOT NULL
    ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_items_numbers_check' AND conrelid = 'public.invoice_items'::regclass) THEN
    ALTER TABLE public.invoice_items ADD CONSTRAINT invoice_items_numbers_check CHECK (
      quantity IS NOT NULL
      AND quantity > 0
      AND unit_price IS NOT NULL
      AND unit_price >= 0
      AND COALESCE(line_total, 0) >= 0
    ) NOT VALID;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_invoice_client_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = NEW.client_id
      AND clients.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'client_id must belong to the same user_id as the invoice';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.validate_invoice_item_owner_and_total()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.invoices
    WHERE invoices.id = NEW.invoice_id
      AND invoices.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'invoice item must belong to an invoice owned by the same user_id';
  END IF;

  NEW.line_total = ROUND((COALESCE(NEW.quantity, 0) * COALESCE(NEW.unit_price, 0))::numeric, 2);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_invoice_client_owner_trigger ON public.invoices;
CREATE TRIGGER validate_invoice_client_owner_trigger
  BEFORE INSERT OR UPDATE OF client_id, user_id ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.validate_invoice_client_owner();

DROP TRIGGER IF EXISTS validate_invoice_item_owner_and_total_trigger ON public.invoice_items;
CREATE TRIGGER validate_invoice_item_owner_and_total_trigger
  BEFORE INSERT OR UPDATE OF invoice_id, user_id, quantity, unit_price ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_invoice_item_owner_and_total();

DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;

CREATE POLICY "Users can insert own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      client_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = invoices.client_id
          AND clients.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      client_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clients
        WHERE clients.id = invoices.client_id
          AND clients.user_id = auth.uid()
      )
    )
  );

ALTER TABLE public.invoice_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoice activity logs" ON public.invoice_activity_logs;
DROP POLICY IF EXISTS "Users can insert own invoice activity logs" ON public.invoice_activity_logs;

CREATE POLICY "Users can view own invoice activity logs"
  ON public.invoice_activity_logs FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_activity_logs.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice activity logs"
  ON public.invoice_activity_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_activity_logs.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT ON public.invoice_activity_logs TO authenticated;

CREATE INDEX IF NOT EXISTS idx_invoice_activity_logs_invoice_id ON public.invoice_activity_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_activity_logs_user_id ON public.invoice_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_activity_logs_created_at ON public.invoice_activity_logs(created_at);

NOTIFY pgrst, 'reload schema';
