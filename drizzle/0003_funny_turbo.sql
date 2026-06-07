CREATE TABLE `letter_types` (
	`id` varchar(128) NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(500),
	`template` text,
	`required_fields` json DEFAULT ('[]'),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `letter_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `letter_types_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `letter_requests` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`letter_type_id` varchar(128) NOT NULL,
	`purpose` varchar(500) NOT NULL,
	`data` json,
	`status` enum('DIAJUKAN','DIPROSES','DISETUJUI','DITOLAK','SELESAI') NOT NULL DEFAULT 'DIAJUKAN',
	`letter_number` varchar(100),
	`verification_code` varchar(64),
	`pdf_path` varchar(255),
	`rejection_reason` text,
	`verified_by` varchar(128),
	`approved_by` varchar(128),
	`verified_at` datetime,
	`approved_at` datetime,
	`completed_at` datetime,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `letter_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `letter_requests_verification_code_unique` UNIQUE(`verification_code`)
);
--> statement-breakpoint
CREATE TABLE `letter_request_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`request_id` varchar(128) NOT NULL,
	`status` enum('DIAJUKAN','DIPROSES','DISETUJUI','DITOLAK','SELESAI') NOT NULL,
	`note` varchar(500),
	`changed_by` varchar(128),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `letter_request_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `letter_requests` ADD CONSTRAINT `letter_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_requests` ADD CONSTRAINT `letter_requests_letter_type_id_letter_types_id_fk` FOREIGN KEY (`letter_type_id`) REFERENCES `letter_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_requests` ADD CONSTRAINT `letter_requests_verified_by_users_id_fk` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_requests` ADD CONSTRAINT `letter_requests_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_request_logs` ADD CONSTRAINT `letter_request_logs_request_id_letter_requests_id_fk` FOREIGN KEY (`request_id`) REFERENCES `letter_requests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `letter_request_logs` ADD CONSTRAINT `letter_request_logs_changed_by_users_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;