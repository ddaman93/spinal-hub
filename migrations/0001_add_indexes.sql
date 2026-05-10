CREATE INDEX "chat_messages_channel_created_at_idx" ON "chat_messages" USING btree ("channel","created_at");--> statement-breakpoint
CREATE INDEX "message_reports_resolved_created_at_idx" ON "message_reports" USING btree ("resolved","created_at");--> statement-breakpoint
CREATE INDEX "sci_provider_reviews_provider_created_at_idx" ON "sci_provider_reviews" USING btree ("provider_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_idx" ON "users" USING btree (lower("email"));