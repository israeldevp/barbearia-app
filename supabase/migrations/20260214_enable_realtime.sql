-- Enable realtime for admin_notifications table
begin;
  alter publication supabase_realtime add table admin_notifications;
commit;
