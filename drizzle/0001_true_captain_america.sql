ALTER TABLE `user_tokens` MODIFY COLUMN `meta` json;--> statement-breakpoint
ALTER TABLE `user_tokens` ADD `type` enum('OTP','PasswordChange','EmailChange') NOT NULL;