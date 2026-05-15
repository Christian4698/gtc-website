CREATE TABLE `certifications_data` (
  `id` int AUTO_INCREMENT NOT NULL,
  `certificationId` varchar(32) NOT NULL,
  `fullName` varchar(256) NOT NULL,
  `email` varchar(320),
  `phone` varchar(64),
  `trainingName` varchar(256) NOT NULL,
  `level` enum('Beginner / Debutant','Intermediate / Intermediaire','Advanced / Avance','Expert','Mastery / Maitrise') NOT NULL DEFAULT 'Beginner / Debutant',
  `documentType` varchar(128) NOT NULL DEFAULT 'Certificate of Completion',
  `status` enum('Valide','Reussi') NOT NULL DEFAULT 'Valide',
  `score` int,
  `issueDate` varchar(10) NOT NULL,
  `participantImageUrl` varchar(1024),
  `qrCodeUrl` varchar(1024),
  `pdfUrl` varchar(1024),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `certifications_data_id` PRIMARY KEY(`id`),
  CONSTRAINT `certifications_data_certificationId_unique` UNIQUE(`certificationId`)
);

