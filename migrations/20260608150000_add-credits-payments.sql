-- 사용자 크레딧 잔액 테이블
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 결제 기록 테이블
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  payment_key TEXT,
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  toss_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 크레딧 차감 (원자적 연산)
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.user_credits
  SET balance = balance - 1, updated_at = NOW()
  WHERE user_id = p_user_id AND balance > 0
  RETURNING balance INTO new_balance;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  RETURN new_balance;
END;
$$;

-- 크레딧 충전 (원자적 연산, 없으면 생성)
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_credits INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  INSERT INTO public.user_credits (user_id, balance, updated_at)
  VALUES (p_user_id, p_credits, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.user_credits.balance + p_credits, updated_at = NOW()
  RETURNING balance INTO new_balance;

  RETURN new_balance;
END;
$$;

-- RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own credits read" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own credits write" ON public.user_credits FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments read" ON public.payment_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own payments insert" ON public.payment_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own payments update" ON public.payment_records FOR UPDATE USING (auth.uid() = user_id);
