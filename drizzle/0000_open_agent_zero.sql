CREATE TABLE `users` (
	`id` varchar(128) NOT NULL,
	`position_id` varchar(128),
	`name` varchar(255) NOT NULL,
	`nik` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('user','staff','admin') NOT NULL DEFAULT 'user',
	`religion` enum('islam','kristen','katolik','hindu','buddha','konghucu'),
	`address` varchar(255),
	`birthday` date,
	`place_of_birth` varchar(255),
	`job` varchar(255),
	`gender` enum('L','P'),
	`telp` varchar(255),
	`citizenship` enum('wni','wna'),
	`status` enum('Belum Menikah','Menikah','Cerai Hidup','Cerai Mati'),
	`education` enum('SD/Sederajat','SMP/Sederajat','SMA/Sederajat','D1','D2','D3','S1/Setara D4','S2','S3'),
	`email_verified_at` datetime,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_nik_unique` UNIQUE(`nik`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` varchar(128) NOT NULL,
	`category` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_tokens` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`token` varchar(255) NOT NULL,
	`meta` json NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` datetime,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_position_id_positions_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_tokens` ADD CONSTRAINT `user_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;