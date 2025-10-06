-- Seed example data for a demo user (replace with your auth uid when running locally)
-- Select a valid auth user id and set it here before running:
-- \set uid '00000000-0000-0000-0000-000000000000'

insert into public.items (id, user_id, url, platform, title, caption, author, thumbnail_url)
values
  (gen_random_uuid(), :'uid', 'https://www.tiktok.com/@coffee/videos/123', 'tiktok', 'Best latte art', 'Barista tricks #coffee', 'Coffee Club', 'https://example.com/latte.jpg'),
  (gen_random_uuid(), :'uid', 'https://www.youtube.com/watch?v=abcdef', 'youtube', 'How to pack for Japan', 'Carry-on only #travel', 'Jet Set', 'https://img.youtube.com/vi/abcdef/hqdefault.jpg'),
  (gen_random_uuid(), :'uid', 'https://www.instagram.com/p/xyz', 'instagram', '10-minute HIIT', 'Quick #workout at home', 'FitLife', 'https://example.com/hiit.jpg');

-- Tag them
insert into public.item_tags (item_id, tag, confidence)
select id, 'Food', 0.7 from public.items where user_id = :'uid' and title like '%latte%';
insert into public.item_tags (item_id, tag, confidence)
select id, 'Travel', 0.8 from public.items where user_id = :'uid' and title like '%Japan%';
insert into public.item_tags (item_id, tag, confidence)
select id, 'Fitness', 0.8 from public.items where user_id = :'uid' and title like '%HIIT%';


