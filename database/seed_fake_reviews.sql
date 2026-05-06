-- Fake Reviews Seed Data for Testing
-- Inserts 5 realistic fake public reviews for each menu item

DO $$
DECLARE
  v_user_id UUID;
  v_item RECORD;
  i INT;
BEGIN
  -- Get any existing user to attach reviews to
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- For each menu item, insert 5 fake reviews
  FOR v_item IN SELECT id, name FROM public.menu_items LOOP
    FOR i IN 1..5 LOOP
      INSERT INTO public.reviews (user_id, menu_item_id, rating_thumbs, public_note, created_at)
      VALUES (
        v_user_id,
        v_item.id,
        CASE WHEN i <= 4 THEN true ELSE false END,
        CASE i
          WHEN 1 THEN 'Absolutely incredible! One of the best things I have eaten in Karachi. Will definitely order again!'
          WHEN 2 THEN 'The flavors were spot on. Chef really knows what they are doing. Highly recommended.'
          WHEN 3 THEN 'Great dish, perfectly cooked. The portion size was generous and the presentation was beautiful.'
          WHEN 4 THEN 'Really enjoyed this. Fresh ingredients and the taste was authentic. My whole family loved it.'
          WHEN 5 THEN 'Was a bit disappointed today. The taste was slightly off compared to last time. Hope it improves.'
        END,
        NOW() - (i || ' days')::INTERVAL
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
