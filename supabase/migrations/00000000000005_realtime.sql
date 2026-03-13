-- Enable Realtime for tables
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table follows;
