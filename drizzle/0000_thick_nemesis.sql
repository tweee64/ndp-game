CREATE TABLE `ndp-game_post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256),
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `ndp-game_post` (`name`);--> statement-breakpoint
CREATE TABLE `ndp-game_wordle_score` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playerName` text(40) NOT NULL,
	`score` integer NOT NULL,
	`wordsSolved` integer NOT NULL,
	`totalWords` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `wordle_score_score_idx` ON `ndp-game_wordle_score` (`score`);