-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 30, 2026 at 02:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `turf_score_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `addonproduct`
--

CREATE TABLE `addonproduct` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` double NOT NULL,
  `isRentable` tinyint(1) NOT NULL DEFAULT 1,
  `stockCount` int(11) NOT NULL DEFAULT 10,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addonproduct`
--

INSERT INTO `addonproduct` (`id`, `name`, `description`, `price`, `isRentable`, `stockCount`, `isActive`, `createdAt`, `updatedAt`) VALUES
('07af4c0e-790d-449d-8ace-10f152f0d265', 'Premium Padel Racket', 'Elite carbon-fiber padel racket rental.', 250, 1, 10, 1, '2026-05-26 07:07:23.229', '2026-05-26 07:07:23.229'),
('53d6342e-412c-445c-8ee5-27189d97103e', 'Training Bibs (Set of 10)', 'Fluorescent mesh bibs for teams (Red vs Blue).', 150, 1, 15, 1, '2026-05-26 07:07:23.229', '2026-05-26 07:07:23.229'),
('7b36afac-97b3-444a-b9ea-8556e384f800', 'Gatorade energy drink', 'Electrolyte replenishment drink (500ml).', 80, 0, 100, 1, '2026-05-26 07:07:23.229', '2026-05-26 07:07:23.229'),
('d60a7d59-917e-44b3-805a-d1d4d457a806', 'Premium Leather Ball', 'Professional grade cricket leather ball for purchase.', 350, 0, 50, 1, '2026-05-26 07:07:23.229', '2026-05-26 07:07:23.229');

-- --------------------------------------------------------

--
-- Table structure for table `adminpaneluser`
--

CREATE TABLE `adminpaneluser` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','TURF_ADMIN','EMPLOYEE') NOT NULL DEFAULT 'TURF_ADMIN',
  `turfId` varchar(36) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `avatarUrl` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastLogin` datetime(3) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adminpaneluser`
--

INSERT INTO `adminpaneluser` (`id`, `email`, `password`, `name`, `role`, `turfId`, `createdAt`, `updatedAt`, `avatarUrl`, `isActive`, `lastLogin`, `phone`, `permissions`) VALUES
('176f8312-1f6a-4cad-8728-3bfbf21c7043', 'dev12@gmail.com', '$2b$10$r99JVRsnNJstAuJbKsDH4e62sejgSmmenfDND8hd2X2/WN439dNU6', 'dev', 'TURF_ADMIN', 'a2ed5503-3316-45ba-97a8-55bb028e3948', '2026-05-26 07:11:53.251', '2026-05-26 07:11:53.251', NULL, 1, NULL, NULL, NULL),
('458ced40-2524-41cb-84db-b6e9ed9df179', 'superadmin@turf.com', '$2b$10$rw8LFKqdhZy2Ems5f4DgHeeZCGRx0lNcNTDzAwSwodbpNZkY9sHMq', 'Super Admin', 'SUPER_ADMIN', NULL, '2026-05-26 06:51:48.681', '2026-05-26 06:51:48.681', NULL, 1, NULL, NULL, NULL),
('4c65c6da-17dc-4fc9-9206-49be883bd8e1', 'john@example.com', '$2b$10$vSvH4iotGSemVWUavotbvuESqukSsQ7uWTK7EWeFcjsr3dieuJQYW', 'John Doe', 'EMPLOYEE', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-26 07:23:34.774', '2026-05-26 07:23:34.774', NULL, 1, NULL, NULL, NULL),
('68cd30d3-84c3-4aa3-85c0-d8cbb4af39cf', 'turfadmin@turf.com', '$2b$10$/UEAwBaC1OPYXHyaHeneCeWm17Oii1QlZkgK7yKbR/sDCuFptdeUC', 'Turf Manager', 'TURF_ADMIN', NULL, '2026-05-26 06:51:48.765', '2026-05-26 06:51:48.765', NULL, 1, NULL, NULL, NULL),
('7a824193-d564-467d-a3fd-8a0421ec91f5', 'superadmin@example.com', '$2b$10$tgpYfhPnXIyHWNbo5W9cTOjKOy6KytirIJkOUBMorFS9CSDZzol3S', 'Super Admin', 'SUPER_ADMIN', NULL, '2026-05-26 07:07:38.941', '2026-05-26 07:07:38.941', NULL, 1, NULL, NULL, NULL),
('7f46d701-8748-462d-ba6f-6b7e88e920a2', 'aman12@gmail.com', '$2b$10$NDqjV98TuhddKxQ3cV3oK.mCYhnRpEIEVe7n/KV0xawSoL70XZX..', 'aman', 'EMPLOYEE', 'a2ed5503-3316-45ba-97a8-55bb028e3948', '2026-05-26 07:25:00.480', '2026-05-26 07:25:00.480', NULL, 1, NULL, NULL, NULL),
('a5c915d3-5f38-4f3a-b822-e301fa440ee7', 'turfadmin1@example.com', '$2b$10$tgpYfhPnXIyHWNbo5W9cTOjKOy6KytirIJkOUBMorFS9CSDZzol3S', 'Turf Admin 1', 'TURF_ADMIN', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-26 07:07:39.072', '2026-05-26 07:07:39.072', NULL, 1, NULL, NULL, NULL),
('f8963215-2a61-4c24-825f-020481ebd0f0', 'employee@turf.com', '$2b$10$9SJuKyC8VqPqoS28/8EJGeUxH9/YB5HbuurQMke72CSPpT0bweLbC', 'Turf Employee', 'EMPLOYEE', NULL, '2026-05-26 06:51:48.782', '2026-05-26 06:51:48.782', NULL, 1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `banner`
--

CREATE TABLE `banner` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `imageUrl` text NOT NULL,
  `linkUrl` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banner`
--

INSERT INTO `banner` (`id`, `title`, `imageUrl`, `linkUrl`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
('5b913e0c-c0d4-44cd-8f5a-ff321e02793d', 'devendra', 'https://cdn.dribbble.com/userupload/46990699/file/127645861349adcf3beb0eb93484a9ab.png?resize=752x&vertical=center', 'https://cdn.dribbble.com/userupload/46990699/file/127645861349adcf3beb0eb93484a9ab.png?resize=752x&vertical=center', 1, 3, '2026-05-26 14:45:37.815', '2026-05-26 15:30:17.186'),
('9d83bcd5-e7bb-4b59-bdcf-3689e3d1f4e1', 'Flat 15% Off on Morning Slots', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', 'welcome10', 1, 2, '2026-05-26 07:07:23.238', '2026-05-26 15:30:26.493'),
('b63ce26d-1886-413c-9e98-38efcf603dbc', 'Monsoon Football Tournament 2026', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80', 'https://turfscore.com/tournament/monsoon-2026', 0, 1, '2026-05-26 07:07:23.238', '2026-05-26 14:48:38.714');

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `turfId` varchar(36) NOT NULL,
  `slotId` varchar(36) NOT NULL,
  `amount` double NOT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED','CANCEL_REQUESTED','COMPLETED','NO_SHOW','REFUNDED') NOT NULL DEFAULT 'CONFIRMED',
  `razorpayId` varchar(255) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `additionalNotes` text DEFAULT NULL,
  `bookingNumber` varchar(50) NOT NULL,
  `cancelledBy` varchar(20) DEFAULT NULL,
  `checkInStatus` tinyint(1) NOT NULL DEFAULT 0,
  `checkInTime` datetime(3) DEFAULT NULL,
  `couponCode` varchar(50) DEFAULT NULL,
  `discountAmount` double NOT NULL DEFAULT 0,
  `paymentStatus` varchar(20) NOT NULL DEFAULT 'PENDING',
  `subTotal` double NOT NULL DEFAULT 0,
  `taxAmount` double NOT NULL DEFAULT 0,
  `checkedInById` varchar(36) DEFAULT NULL,
  `teamId` varchar(36) DEFAULT NULL,
  `challengeId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`id`, `userId`, `turfId`, `slotId`, `amount`, `status`, `razorpayId`, `createdAt`, `additionalNotes`, `bookingNumber`, `cancelledBy`, `checkInStatus`, `checkInTime`, `couponCode`, `discountAmount`, `paymentStatus`, `subTotal`, `taxAmount`, `checkedInById`, `teamId`, `challengeId`) VALUES
('030c6759-3be3-413e-9121-ca201eeef812', '8078200b-c7c4-408b-811b-179cb0d3a781', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '87ed10a3-be0a-472e-ac29-9afd97b5acca', 1200, 'COMPLETED', NULL, '2026-05-26 04:30:00.000', NULL, '27964b4c-50ff-48aa-9198-f0fc023ee050', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('0ddc78f2-149f-4e6c-ace2-c1d1717c6b29', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '14e1b680-3cb3-43aa-af4e-06fde1d9a911', 1500, 'CONFIRMED', NULL, '2026-05-25 06:30:00.000', NULL, '9aee843d-041e-4e6f-9148-ca206285a5b9', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('13ee95bd-2319-468e-b21e-5b17fd2c758b', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', 'c009d5e9-678a-41f7-9bb2-fc777ecaf309', 2781, 'CONFIRMED', 'pay_mock_7dxs2kx84', '2026-05-26 15:54:05.126', NULL, '2fe5f5ef-3bf8-4ee2-8c3b-31702ce6b3b9', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('17f54512-d687-4630-8943-05a26070f148', '8078200b-c7c4-408b-811b-179cb0d3a781', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', 'f51e7f80-b535-46ce-b0d6-ed0e30fe114a', 1500, 'CONFIRMED', NULL, '2026-05-21 06:30:00.000', NULL, 'e6dfa689-93ab-420c-afbc-2328e368449f', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('293cf900-060b-443a-b973-5ffc2369710e', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'e3589eb7-f132-4ee0-b049-4b6c2f396f47', 1200, 'COMPLETED', NULL, '2026-05-20 05:30:00.000', NULL, 'a5cb75c0-83d4-49cd-a68e-774d0978f022', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('2e7af1a8-549c-4fee-875f-d9d0ece44989', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'dbb883d5-a929-4890-bd2d-12c942a47b4d', 1200, 'COMPLETED', NULL, '2026-05-24 06:30:00.000', NULL, 'df82ec08-91ec-486c-8382-ca93cd03d8a6', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('2ec77a7b-b964-4a0c-b1c0-16388d261a2e', '8078200b-c7c4-408b-811b-179cb0d3a781', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'f3f43baa-6c5d-4d54-9e92-89a550b3e3f3', 1200, 'CONFIRMED', NULL, '2026-05-24 04:30:00.000', NULL, 'dbc52548-4200-4101-8f22-56780aab985f', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('3a500afc-2318-4ae3-aa9b-59a9cda37d04', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'ac785769-d2c2-4241-9364-5330c840f61e', 1200, 'COMPLETED', NULL, '2026-05-25 04:30:00.000', NULL, '0afb04cf-3349-49a8-a981-fcd412ff1870', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('3d2d369f-5c2e-4406-9263-2e87dffd592e', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', '19e1f5f2-24ac-417e-ac84-e262e5640db9', 'dab0d67b-cd7f-436b-bbb9-9129b3602f29', 800, 'CONFIRMED', 'pay_mock_9av1103h8', '2026-05-27 10:47:25.594', NULL, '707a99bb-012f-403c-b7a8-5ef7cd54214c', NULL, 1, '2026-05-27 10:47:42.680', NULL, 0, 'PENDING', 0, 0, '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', NULL, NULL),
('428c3b88-f537-4ce1-ac60-b0e24c0b8aa9', '8078200b-c7c4-408b-811b-179cb0d3a781', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'bf508521-f1e5-4b50-b111-6c042e0a35e5', 1200, 'CONFIRMED', NULL, '2026-05-21 04:30:00.000', NULL, 'c85eb916-9759-4f7a-8048-7972951d5d2e', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('4519fa7c-3e0b-49a0-8366-ae5029d013e9', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', 'a2ed5503-3316-45ba-97a8-55bb028e3948', '78864bff-dc23-4afa-ae2e-8c18d72bdd41', 1100, 'CANCELLED', 'pay_mock_r62ng1kxj', '2026-05-26 11:34:45.071', NULL, 'b7cf2d8c-63c7-444c-b3b3-beb4bff40384', NULL, 1, '2026-05-26 11:34:59.417', NULL, 0, 'PENDING', 0, 0, '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', NULL, NULL),
('4b1756ab-360e-42ce-adfa-089a6880a31f', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '4f682c96-848d-453f-9c30-cd10b3bdd81d', 1200, 'CONFIRMED', NULL, '2026-05-25 05:30:00.000', NULL, '6ce1bfa6-8087-4e59-be22-d87782ad6f23', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('52a77de2-7e94-44b7-a9b6-76cbe455e951', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '651a3bab-e058-47aa-87bc-a1637e6c10c2', 1500, 'COMPLETED', NULL, '2026-05-23 05:30:00.000', NULL, '73977209-0a06-4ade-a14b-7f114d7261a6', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('55737532-b58a-4311-99e8-d2f4af41b4a4', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', 'd2ae1af1-2c89-410e-b49e-404dfc680885', 1500, 'COMPLETED', NULL, '2026-05-26 06:30:00.000', NULL, '8b1d0f73-6f5f-493c-904c-8933eabb13d6', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('576e74e0-a076-497c-a58c-b19fb1132c6b', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'e19e12bc-b3a2-4f92-bdb2-cbd5829c22a5', 1200, 'CONFIRMED', NULL, '2026-05-26 05:30:00.000', NULL, 'a9d189dd-7f5d-49fc-9611-12b0e2be78dc', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('57d9ab7c-5ced-47d0-a017-31fc97563737', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', '19e1f5f2-24ac-417e-ac84-e262e5640db9', 'af071cc5-aa53-4628-8302-a744bb16a68b', 1200, 'CONFIRMED', 'pay_mock_nlo0dj5o5', '2026-05-26 16:24:54.534', NULL, '0d700e85-ce8a-41fc-be8c-32ee7161c3db', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('7669ec54-4684-4dac-b4d1-6fb38a82913b', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', '19e1f5f2-24ac-417e-ac84-e262e5640db9', 'a790c614-2cd6-4210-9f94-2323ca5486fe', 800, 'CONFIRMED', 'pay_mock_dhkqbjjhq', '2026-05-27 12:01:03.445', NULL, 'd4b7a0f8-cb08-4245-910d-49dbaded0fd9', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('76adb764-15fc-4a4f-80f8-39cafc7201a2', '8078200b-c7c4-408b-811b-179cb0d3a781', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '16e42506-b3f4-4b05-bb48-0c55bd2bd959', 1200, 'COMPLETED', NULL, '2026-05-21 05:30:00.000', NULL, '27e85166-317d-49cb-ba50-01a983d51e6c', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('7a7c2d1d-93e6-4333-a780-83045e27b9e3', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '6238386a-4999-4101-b166-5b81dc965b9e', 3430, 'CONFIRMED', 'pay_mock_vof1syegt', '2026-05-26 14:50:02.659', NULL, 'f7f67d0d-7b92-459c-8a39-1abd6aa0f556', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('818d5570-cd51-4a49-b423-35e922a345c6', '8078200b-c7c4-408b-811b-179cb0d3a781', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '6306a22d-cd4e-4458-833e-00276546e38a', 1200, 'CONFIRMED', NULL, '2026-05-22 05:30:00.000', NULL, '5d5f7281-4268-4145-97e3-16afd9aa1a50', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('82f9be30-ee00-4ace-ba37-b6d5d1f44781', '6ecbee09-285f-4454-8c24-78e7e4045ede', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '6d7c32fc-08fc-48a2-8c55-e230bfff4e8f', 1200, 'CONFIRMED', 'pay_mock_ysts12jp4', '2026-05-27 10:59:21.425', NULL, '34c7bdf3-3e48-4707-8e37-54efef92caf0', NULL, 1, '2026-05-27 10:59:40.404', NULL, 0, 'PENDING', 0, 0, '6ecbee09-285f-4454-8c24-78e7e4045ede', NULL, NULL),
('8d2e2cb8-5227-4aef-9d98-769d985ad065', '8078200b-c7c4-408b-811b-179cb0d3a781', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', 'a37b0d86-df71-42da-95b3-e94b1f64ac7b', 1500, 'COMPLETED', NULL, '2026-05-20 04:30:00.000', NULL, '3046edc0-b19f-4de4-b8f3-9ca4c26e86fa', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('8d9d566e-73cc-4998-9a20-5d5e0af11cc5', '8078200b-c7c4-408b-811b-179cb0d3a781', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', 'a7dd7a73-fb06-4e59-a22b-f50eafa720f2', 1500, 'COMPLETED', NULL, '2026-05-22 04:30:00.000', NULL, 'de593695-ef66-40c4-bacf-ccecffad747c', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('a7049a72-0738-4c24-85d4-abdd4a9c289e', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', 'a2ed5503-3316-45ba-97a8-55bb028e3948', 'fd9e51f4-d4f0-408c-80ff-dc8ebebe8df8', 800, 'CONFIRMED', 'pay_mock_7rfuoescl', '2026-05-26 11:30:29.201', NULL, '9ea5cfbb-f7d6-498a-84f9-da94dd9623e2', NULL, 1, '2026-05-26 11:30:46.654', NULL, 0, 'PENDING', 0, 0, '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', NULL, NULL),
('b3266299-f616-405c-b9b1-a4dc204526e4', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '00505bca-7513-4356-88b5-ecbfd3db5bec', 1500, 'CONFIRMED', NULL, '2026-05-23 04:30:00.000', NULL, 'ddb94f1a-36ac-401e-9168-639f4de24acf', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('bed39a59-4a72-4e97-a835-3cf5bda74fce', '8078200b-c7c4-408b-811b-179cb0d3a781', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'e0a063ab-f89f-4b40-8076-f53cb1721635', 1200, 'CONFIRMED', NULL, '2026-05-24 05:30:00.000', NULL, 'e04929f1-c834-4530-9589-3b194070055a', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('eb3a1993-63eb-496f-ac1b-32e553be3bf1', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', '19e1f5f2-24ac-417e-ac84-e262e5640db9', '0f196453-df2a-4cba-94cb-7d6a91f79168', 800, 'CONFIRMED', 'pay_mock_wnm5mqew2', '2026-05-27 10:43:50.203', NULL, '1d1d0520-a77d-48ec-8b61-832fb6177f69', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('f1c5cc49-c99f-4e7d-9612-ba0f3c27c773', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', 'c46bf224-798f-422d-b53a-190ba11a0412', 1500, 'CONFIRMED', NULL, '2026-05-22 06:30:00.000', NULL, '738034b7-e5bd-457f-90c9-fa60d4bae65f', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('f2d78c64-6023-4e36-ad41-f74453274523', '9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'c3dee134-7b3b-4a0a-8985-6d0051e19e7c', 1200, 'CONFIRMED', NULL, '2026-05-23 06:30:00.000', NULL, '84579802-be08-48dd-9544-3f5731d5561e', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL),
('fccb4320-6fbb-4f6d-8ab8-8e72833d0f1f', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '9ee721e9-14bd-426a-9660-bdfca1d9d1ee', 2603, 'CONFIRMED', 'pay_mock_6k1z2y1q0', '2026-05-26 15:55:23.844', NULL, 'f972ca24-47c9-43e3-b2e1-49eea19476df', NULL, 0, NULL, NULL, 0, 'PENDING', 0, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bookingaddon`
--

CREATE TABLE `bookingaddon` (
  `id` varchar(36) NOT NULL,
  `bookingId` varchar(36) NOT NULL,
  `addOnProductId` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `pricePaid` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cancellationpolicy`
--

CREATE TABLE `cancellationpolicy` (
  `id` varchar(36) NOT NULL,
  `turfId` varchar(36) NOT NULL,
  `freeCancellationHours` int(11) NOT NULL DEFAULT 6,
  `partialRefundPercent` int(11) NOT NULL DEFAULT 50,
  `rainProtection` tinyint(1) NOT NULL DEFAULT 1,
  `weatherCheckEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cancellationpolicy`
--

INSERT INTO `cancellationpolicy` (`id`, `turfId`, `freeCancellationHours`, `partialRefundPercent`, `rainProtection`, `weatherCheckEnabled`, `createdAt`, `updatedAt`) VALUES
('3bbbe7a9-24b6-410e-a4e1-50f3f5ed6838', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', 6, 50, 1, 1, '2026-05-26 07:07:23.392', '2026-05-26 07:07:23.392'),
('5990203e-1489-4b13-a2c1-70ea093b117d', 'e2344396-28c0-4d26-8034-72953f1a8e59', 6, 50, 1, 1, '2026-05-26 07:07:23.321', '2026-05-26 07:07:23.321'),
('963237d2-7b8e-41bf-8da2-0cc6365ce652', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', 6, 50, 1, 1, '2026-05-26 07:07:23.255', '2026-05-26 07:07:23.255');

-- --------------------------------------------------------

--
-- Table structure for table `cancellationrequest`
--

CREATE TABLE `cancellationrequest` (
  `id` varchar(36) NOT NULL,
  `bookingId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `reason` text NOT NULL,
  `reasonType` enum('WEATHER','PERSONAL','EMERGENCY','TURF_ISSUE','OTHER') NOT NULL,
  `refundAmount` double NOT NULL,
  `refundStatus` enum('PENDING','APPROVED','REJECTED','PROCESSED') NOT NULL DEFAULT 'PENDING',
  `weatherData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`weatherData`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `processedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cancellationrequest`
--

INSERT INTO `cancellationrequest` (`id`, `bookingId`, `userId`, `reason`, `reasonType`, `refundAmount`, `refundStatus`, `weatherData`, `createdAt`, `processedAt`) VALUES
('1c5e350a-5cbd-4c19-916f-36c8220156ce', '4519fa7c-3e0b-49a0-8366-ae5029d013e9', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', 'User requested cancellation via App', 'PERSONAL', 1100, 'PROCESSED', NULL, '2026-05-26 11:36:22.166', '2026-05-26 11:40:03.807');

-- --------------------------------------------------------

--
-- Table structure for table `challenge`
--

CREATE TABLE `challenge` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sportType` enum('CRICKET','FOOTBALL','TENNIS','BADMINTON','BASKETBALL','VOLLEYBALL') NOT NULL,
  `type` enum('INDIVIDUAL','TEAM') NOT NULL DEFAULT 'INDIVIDUAL',
  `status` enum('OPEN','ACCEPTED','CANCELLED','COMPLETED','EXPIRED') NOT NULL DEFAULT 'OPEN',
  `creatorId` varchar(36) NOT NULL,
  `challengerTeamId` varchar(36) DEFAULT NULL,
  `opponentId` varchar(36) DEFAULT NULL,
  `opponentTeamId` varchar(36) DEFAULT NULL,
  `turfId` varchar(36) DEFAULT NULL,
  `scheduledDate` varchar(20) DEFAULT NULL,
  `scheduledTime` varchar(10) DEFAULT NULL,
  `skillLevel` varchar(50) NOT NULL DEFAULT 'ALL',
  `maxPlayers` int(11) NOT NULL DEFAULT 10,
  `message` text DEFAULT NULL,
  `shareCode` varchar(36) NOT NULL,
  `isPublic` tinyint(1) NOT NULL DEFAULT 1,
  `expiresAt` datetime(3) DEFAULT NULL,
  `acceptedAt` datetime(3) DEFAULT NULL,
  `creatorPaid` tinyint(1) NOT NULL DEFAULT 0,
  `opponentPaid` tinyint(1) NOT NULL DEFAULT 0,
  `creatorScore` int(11) DEFAULT NULL,
  `opponentScore` int(11) DEFAULT NULL,
  `winnerId` varchar(36) DEFAULT NULL,
  `slotId` varchar(36) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `challenge`
--

INSERT INTO `challenge` (`id`, `title`, `description`, `sportType`, `type`, `status`, `creatorId`, `challengerTeamId`, `opponentId`, `opponentTeamId`, `turfId`, `scheduledDate`, `scheduledTime`, `skillLevel`, `maxPlayers`, `message`, `shareCode`, `isPublic`, `expiresAt`, `acceptedAt`, `creatorPaid`, `opponentPaid`, `creatorScore`, `opponentScore`, `winnerId`, `slotId`, `createdAt`, `updatedAt`) VALUES
('18fe03ce-c9a6-4b4c-8bf6-1bfd840bddf1', 'Sjse5', 'Djsxbnsx', 'TENNIS', 'INDIVIDUAL', 'ACCEPTED', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', NULL, '6ecbee09-285f-4454-8c24-78e7e4045ede', NULL, '19e1f5f2-24ac-417e-ac84-e262e5640db9', '2026-05-29', NULL, 'ALL', 1, NULL, '382ead9c-42cb-405c-a579-52969f366797', 1, '2026-06-05 05:53:58.748', '2026-05-29 06:11:26.814', 0, 0, NULL, NULL, NULL, NULL, '2026-05-29 05:53:58.750', '2026-05-29 06:11:26.816'),
('d6c25022-8574-4fa6-be04-2ffb70d4af31', 'Sjse5', 'Djsxbnsx', 'TENNIS', 'INDIVIDUAL', 'ACCEPTED', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', NULL, '6ecbee09-285f-4454-8c24-78e7e4045ede', NULL, '19e1f5f2-24ac-417e-ac84-e262e5640db9', '2026-05-29', NULL, 'ALL', 1, NULL, '158718e0-676a-4705-85b5-08a7cab89093', 1, '2026-06-05 05:53:47.108', '2026-05-29 06:09:46.610', 0, 1, NULL, NULL, NULL, NULL, '2026-05-29 05:53:47.111', '2026-05-29 06:09:55.509');

-- --------------------------------------------------------

--
-- Table structure for table `coupon`
--

CREATE TABLE `coupon` (
  `id` varchar(36) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discountType` varchar(20) NOT NULL DEFAULT 'PERCENTAGE',
  `value` double NOT NULL,
  `minBookingAmt` double NOT NULL DEFAULT 0,
  `maxDiscountAmt` double NOT NULL DEFAULT 1000,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `usageLimit` int(11) NOT NULL DEFAULT 100,
  `usedCount` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupon`
--

INSERT INTO `coupon` (`id`, `code`, `discountType`, `value`, `minBookingAmt`, `maxDiscountAmt`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `isActive`, `createdAt`, `updatedAt`) VALUES
('2fb1e267-a62a-4f91-ba66-fc2f9ff707d5', 'WELCOME10', 'PERCENTAGE', 10, 500, 200, '2026-05-26 07:07:23.221', '2026-06-25 07:07:23.221', 500, 0, 1, '2026-05-26 07:07:23.222', '2026-05-26 07:07:23.222'),
('973e4185-f6b4-49f8-96e1-50b0f39be024', 'TURF500', 'FLAT', 500, 2000, 500, '2026-05-26 07:07:23.221', '2026-06-10 07:07:23.221', 100, 0, 1, '2026-05-26 07:07:23.222', '2026-05-26 07:07:23.222');

-- --------------------------------------------------------

--
-- Table structure for table `favorite`
--

CREATE TABLE `favorite` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `turfId` varchar(36) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groupbooking`
--

CREATE TABLE `groupbooking` (
  `id` varchar(36) NOT NULL,
  `bookingId` varchar(36) NOT NULL,
  `captainId` varchar(36) NOT NULL,
  `totalPlayers` int(11) NOT NULL DEFAULT 1,
  `playersNeeded` int(11) NOT NULL,
  `pricePerPerson` double NOT NULL,
  `isPublic` tinyint(1) NOT NULL DEFAULT 0,
  `inviteCode` varchar(36) NOT NULL,
  `status` enum('OPEN','FULL','CONFIRMED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'OPEN',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) NOT NULL,
  `skillLevel` varchar(50) NOT NULL DEFAULT 'ALL',
  `title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groupmember`
--

CREATE TABLE `groupmember` (
  `id` varchar(36) NOT NULL,
  `groupId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `hasPaid` tinyint(1) NOT NULL DEFAULT 0,
  `paidAmount` double DEFAULT NULL,
  `joinedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `position` varchar(50) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'MEMBER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `type` enum('BOOKING_CONFIRMATION','REMINDER','RAIN_ALERT','PRICE_DROP','PROMOTION','PAYMENT_SUCCESS','CANCELLATION','CHALLENGE_CREATED','CHALLENGE_ACCEPTED') NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `sentAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isEmailSent` tinyint(1) NOT NULL DEFAULT 0,
  `isPushSent` tinyint(1) NOT NULL DEFAULT 0,
  `readAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymentdetail`
--

CREATE TABLE `paymentdetail` (
  `id` varchar(36) NOT NULL,
  `bookingId` varchar(36) NOT NULL,
  `razorpayOrderId` varchar(255) DEFAULT NULL,
  `razorpayPaymentId` varchar(255) DEFAULT NULL,
  `razorpaySignature` text DEFAULT NULL,
  `paymentMethod` varchar(50) DEFAULT NULL,
  `amount` double NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `status` varchar(20) NOT NULL DEFAULT 'SUCCESS',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `billingAddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`billingAddress`)),
  `errorMessage` text DEFAULT NULL,
  `gateway` varchar(50) NOT NULL DEFAULT 'RAZORPAY',
  `transactionFee` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `paymentdetail`
--

INSERT INTO `paymentdetail` (`id`, `bookingId`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `paymentMethod`, `amount`, `currency`, `status`, `createdAt`, `billingAddress`, `errorMessage`, `gateway`, `transactionFee`) VALUES
('04f50df6-fc60-4c40-9e66-4915b952360e', '3d2d369f-5c2e-4406-9263-2e87dffd592e', 'order_SuMQNwErMQkWTb', 'pay_mock_9av1103h8', 'mock_signature', 'razorpay', 800, 'INR', 'SUCCESS', '2026-05-27 10:47:25.594', NULL, NULL, 'RAZORPAY', 0),
('179f7894-a869-49dc-b74b-9a4ca766e70b', 'a7049a72-0738-4c24-85d4-abdd4a9c289e', 'order_Stycg0CVLwhbc4', 'pay_mock_7rfuoescl', 'mock_signature', 'razorpay', 800, 'INR', 'SUCCESS', '2026-05-26 11:30:29.201', NULL, NULL, 'RAZORPAY', 0),
('3ff1fe91-14d5-4496-9f87-3f638ce319f8', '7a7c2d1d-93e6-4333-a780-83045e27b9e3', 'order_Su21Z8iAIHCxt1', 'pay_mock_vof1syegt', 'mock_signature', 'razorpay', 3430, 'INR', 'SUCCESS', '2026-05-26 14:50:02.659', NULL, NULL, 'RAZORPAY', 0),
('4b3787c2-7897-45a7-aacc-630392364d72', '7669ec54-4684-4dac-b4d1-6fb38a82913b', 'order_SuNg9sZVKDT8Ub', 'pay_mock_dhkqbjjhq', 'mock_signature', 'razorpay', 800, 'INR', 'SUCCESS', '2026-05-27 12:01:03.445', NULL, NULL, 'RAZORPAY', 0),
('51c7f36f-8220-4bc8-a199-6c0d9e13283f', '4519fa7c-3e0b-49a0-8366-ae5029d013e9', 'order_StyhFRyUucyPOe', 'pay_mock_r62ng1kxj', 'mock_signature', 'razorpay', 1100, 'INR', 'SUCCESS', '2026-05-26 11:34:45.071', NULL, NULL, 'RAZORPAY', 0),
('5562c2b9-715a-436f-a7ff-25718aa9b643', '82f9be30-ee00-4ace-ba37-b6d5d1f44781', 'order_SuMczFPE4UoE27', 'pay_mock_ysts12jp4', 'mock_signature', 'razorpay', 1200, 'INR', 'SUCCESS', '2026-05-27 10:59:21.425', NULL, NULL, 'RAZORPAY', 0),
('5ea1bbe7-4fea-426d-ba22-e0e80999c6b0', '57d9ab7c-5ced-47d0-a017-31fc97563737', 'order_Su3dkr2TXeEmLz', 'pay_mock_nlo0dj5o5', 'mock_signature', 'razorpay', 1200, 'INR', 'SUCCESS', '2026-05-26 16:24:54.534', NULL, NULL, 'RAZORPAY', 0),
('7439e021-fff7-400f-ba82-853cf2d80009', 'fccb4320-6fbb-4f6d-8ab8-8e72833d0f1f', 'order_Su38bA7cTk0e9N', 'pay_mock_6k1z2y1q0', 'mock_signature', 'razorpay', 2603, 'INR', 'SUCCESS', '2026-05-26 15:55:23.844', NULL, NULL, 'RAZORPAY', 0),
('b05bfff7-9526-4dee-a4a7-c5e24d0da5fe', '13ee95bd-2319-468e-b21e-5b17fd2c758b', 'order_Su37Cgwh8Pi0di', 'pay_mock_7dxs2kx84', 'mock_signature', 'razorpay', 2781, 'INR', 'SUCCESS', '2026-05-26 15:54:05.126', NULL, NULL, 'RAZORPAY', 0),
('b2e78dd7-4d1b-47d2-bbc4-db877d231c4a', 'eb3a1993-63eb-496f-ac1b-32e553be3bf1', 'order_SuMMXCMkwdPjYe', 'pay_mock_wnm5mqew2', 'mock_signature', 'razorpay', 800, 'INR', 'SUCCESS', '2026-05-27 10:43:50.203', NULL, NULL, 'RAZORPAY', 0);

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `turfId` varchar(36) NOT NULL,
  `bookingId` varchar(36) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `amenitiesRating` int(11) NOT NULL DEFAULT 5,
  `cleanlinessRating` int(11) NOT NULL DEFAULT 5,
  `helpfulCount` int(11) NOT NULL DEFAULT 0,
  `repliedAt` datetime(3) DEFAULT NULL,
  `reply` text DEFAULT NULL,
  `staffRating` int(11) NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `searchhistory`
--

CREATE TABLE `searchhistory` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `query` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `sportType` enum('CRICKET','FOOTBALL','TENNIS','BADMINTON','BASKETBALL','VOLLEYBALL') DEFAULT NULL,
  `results` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supportticket`
--

CREATE TABLE `supportticket` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'MEDIUM',
  `status` varchar(20) NOT NULL DEFAULT 'OPEN',
  `category` varchar(100) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supportticket`
--

INSERT INTO `supportticket` (`id`, `userId`, `subject`, `description`, `priority`, `status`, `category`, `createdAt`, `updatedAt`) VALUES
('b15af57c-e77a-45b4-8cc5-423483913294', 'test-user-id', 'Refund not credited for Booking #BK-9801', 'I cancelled my slot 12 hours before the start time, but the refund is still showing as pending in my wallet. Please resolve.', 'HIGH', 'OPEN', 'PAYMENT', '2026-05-26 07:07:23.247', '2026-05-26 07:07:23.247');

-- --------------------------------------------------------

--
-- Table structure for table `systemauditlog`
--

CREATE TABLE `systemauditlog` (
  `id` varchar(36) NOT NULL,
  `adminId` varchar(36) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text NOT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `systemauditlog`
--

INSERT INTO `systemauditlog` (`id`, `adminId`, `action`, `details`, `ipAddress`, `createdAt`) VALUES
('2e1fbf6b-d9bf-4368-be56-a69ec1e8d918', NULL, 'SYSTEM_SEED', 'Populated all database tables with expert-level enterprise mock data successfully.', NULL, '2026-05-26 07:07:23.450');

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

CREATE TABLE `team` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sportType` enum('CRICKET','FOOTBALL','TENNIS','BADMINTON','BASKETBALL','VOLLEYBALL') NOT NULL,
  `captainId` varchar(36) NOT NULL,
  `turfId` varchar(36) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team`
--

INSERT INTO `team` (`id`, `name`, `sportType`, `captainId`, `turfId`, `createdAt`, `updatedAt`) VALUES
('1420be74-1c64-49cd-97d0-657316f28547', 'Csk', 'CRICKET', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', NULL, '2026-05-27 11:16:03.333', '2026-05-27 11:16:38.455'),
('fb7a8d0b-1398-43c7-ab62-e9866e12ce26', 'Rcb', 'CRICKET', '6ecbee09-285f-4454-8c24-78e7e4045ede', NULL, '2026-05-27 11:01:43.175', '2026-05-27 11:01:43.175');

-- --------------------------------------------------------

--
-- Table structure for table `teammember`
--

CREATE TABLE `teammember` (
  `id` varchar(36) NOT NULL,
  `teamId` varchar(36) NOT NULL,
  `userId` varchar(36) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'PLAYER',
  `joinedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teammember`
--

INSERT INTO `teammember` (`id`, `teamId`, `userId`, `role`, `joinedAt`, `email`, `name`, `position`) VALUES
('201ee356-e2b9-459b-bb93-bd84facb5b51', '1420be74-1c64-49cd-97d0-657316f28547', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', 'CAPTAIN', '2026-05-27 11:16:03.333', NULL, NULL, NULL),
('33397c0d-dabc-44f7-ba02-552b6259b42c', '1420be74-1c64-49cd-97d0-657316f28547', NULL, 'PLAYER', '2026-05-27 11:16:38.467', 'amankyrrr@gmail.com', 'Ms dhoni', 'Wicket Keeper'),
('372d81dd-a234-4fb9-ade8-5a98c7d9e166', 'fb7a8d0b-1398-43c7-ab62-e9866e12ce26', '6ecbee09-285f-4454-8c24-78e7e4045ede', 'CAPTAIN', '2026-05-27 11:01:43.175', NULL, NULL, NULL),
('a519323c-ba17-49b2-a098-4271d2de0ad6', 'fb7a8d0b-1398-43c7-ab62-e9866e12ce26', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', 'PLAYER', '2026-05-27 11:01:43.175', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` varchar(36) NOT NULL,
  `walletId` varchar(36) NOT NULL,
  `amount` double NOT NULL,
  `type` enum('CREDIT','DEBIT','REFUND','CASHBACK') NOT NULL,
  `description` text NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','COMPLETED','FAILED') NOT NULL DEFAULT 'COMPLETED',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `ipAddress` varchar(45) DEFAULT NULL,
  `newBalance` double NOT NULL DEFAULT 0,
  `previousBalance` double NOT NULL DEFAULT 0,
  `userAgent` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`id`, `walletId`, `amount`, `type`, `description`, `reference`, `status`, `createdAt`, `ipAddress`, `newBalance`, `previousBalance`, `userAgent`) VALUES
('a8047170-beb9-42f4-b5c2-0d8fc717f423', '4e800313-25b0-45f6-97a4-9f95cbe9654f', 2000, 'CREDIT', 'Initial wallet deposit via Razorpay', NULL, 'COMPLETED', '2026-05-26 07:07:23.214', NULL, 2000, 0, NULL),
('c1cc1397-d6d0-4956-80c1-7eccd46688a5', '4e800313-25b0-45f6-97a4-9f95cbe9654f', 500, 'DEBIT', 'Booking payment for Skyline Terrace Pitch', NULL, 'COMPLETED', '2026-05-26 07:07:23.214', NULL, 1500, 2000, NULL),
('df3ec326-2512-4922-9f32-3f52ea3d5892', '4c2d65e3-a619-4808-89f6-710fae4a78ec', 100, 'CREDIT', 'Credited by Super Admin', NULL, 'COMPLETED', '2026-05-27 11:00:26.578', NULL, 100, 0, NULL),
('e5a3e158-c63b-4dc1-aa26-d8dba6616acb', '71cb90d4-e39a-4ce8-aea6-6c94c2860a68', 100, 'CREDIT', 'Credited by Super Admin', NULL, 'COMPLETED', '2026-05-26 15:35:49.138', NULL, 1200, 1100, NULL),
('eb981fb6-dd72-4597-9153-ee675f965f96', '71cb90d4-e39a-4ce8-aea6-6c94c2860a68', 1100, 'REFUND', 'Refund for booking 4519fa7c-3e0b-49a0-8366-ae5029d013e9', NULL, 'COMPLETED', '2026-05-26 11:40:03.794', NULL, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `turf`
--

CREATE TABLE `turf` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` text NOT NULL,
  `description` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'Football',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `sportTypes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sportTypes`)),
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`amenities`)),
  `rating` double NOT NULL DEFAULT 4.5,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `closingTime` varchar(10) NOT NULL DEFAULT '23:00',
  `contactEmail` varchar(255) DEFAULT NULL,
  `contactPhone` varchar(20) DEFAULT NULL,
  `googleMapsUrl` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `openingTime` varchar(10) NOT NULL DEFAULT '06:00',
  `rulesOfVenue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`rulesOfVenue`)),
  `safetyGuidelines` text DEFAULT NULL,
  `entryQrToken` varchar(64) DEFAULT NULL,
  `qrEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `qrUpdatedAt` datetime(3) DEFAULT NULL,
  `cancellationPolicyText` text DEFAULT NULL,
  `groundSize` varchar(100) DEFAULT NULL,
  `groundType` varchar(100) DEFAULT NULL,
  `imageUrl` text DEFAULT NULL,
  `pricePerHour` double NOT NULL DEFAULT 1000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `turf`
--

INSERT INTO `turf` (`id`, `name`, `location`, `description`, `city`, `state`, `category`, `latitude`, `longitude`, `sportTypes`, `amenities`, `rating`, `images`, `createdAt`, `updatedAt`, `closingTime`, `contactEmail`, `contactPhone`, `googleMapsUrl`, `isActive`, `isFeatured`, `openingTime`, `rulesOfVenue`, `safetyGuidelines`, `entryQrToken`, `qrEnabled`, `qrUpdatedAt`, `cancellationPolicyText`, `groundSize`, `groundType`, `imageUrl`, `pricePerHour`) VALUES
('19e1f5f2-24ac-417e-ac84-e262e5640db9', 'new truf checking', 'gomti nagar ', 'done', 'Lucknow', 'Uttar Pradesh', 'Football', NULL, NULL, '[]', '[\"Synthetic Grass\",\"Floodlights\",\"Parking\",\"Wifi\"]', 4.5, '[\"https://cdn.dribbble.com/userupload/11701466/file/original-c9c81da59bad9f854dd651a186927728.jpg?resize=752x&vertical=center\"]', '2026-05-26 16:23:16.568', '2026-05-26 16:27:59.645', '23:00', 'Admin01@gmail.com', '6392178640', NULL, 1, 0, '06:00', '[]', 'sawari apne samanki khud jimmedar hai ', 'b9cb5a3646f07dc5f49927e7c1817940260fb660ceb72916', 1, '2026-05-26 16:27:59.642', 'paisa nh milega wapas ', '9v9', 'football ', 'https://cdn.dribbble.com/userupload/23278309/file/original-7dfcb999b2620c956ea8df78a852900e.jpg?resize=752x&vertical=center', 1000),
('2c2f9127-805b-4892-8a1a-ad1cc06c5412', 'Emerald Arena', 'Downtown District', 'FIFA-pro synthetic grass with advanced LED lighting and premium amenities.', 'Mumbai', 'Maharashtra', 'Football', NULL, NULL, '[\"FOOTBALL\",\"CRICKET\"]', '[\"Wifi\",\"Parking\",\"Shower\",\"Cafeteria\"]', 4.8, '[\"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80\",\"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80\"]', '2026-05-26 07:07:23.255', '2026-05-26 11:21:06.909', '23:00', 'emerald@turfs.com', '9988776655', NULL, 1, 1, '06:00', '[\"No metal studs allowed.\",\"Please arrive 10 minutes early.\",\"Non-marking shoes only on indoor court.\"]', NULL, 'a159f1fe137339e7fbeb9f820bbc975a0b882ada9e455b5c', 1, '2026-05-26 11:21:06.908', NULL, NULL, NULL, NULL, 1000),
('51bee5c7-3e6d-48d1-8828-a7231eef9ac5', 'Victory Valley', 'Bandra Reclamation', 'The preferred choice for weekend tournaments and company matches.', 'Mumbai', 'Maharashtra', 'Cricket', NULL, NULL, '[\"CRICKET\"]', '[\"Wifi\",\"Shower\",\"Cafeteria\"]', 4.2, '[\"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80\"]', '2026-05-26 07:07:23.392', '2026-05-27 10:21:47.610', '23:00', 'victory@turfs.com', '7766554433', NULL, 1, 1, '06:00', '[\"Cricket gear available on rent.\",\"No outside food allowed.\"]', NULL, '9103dbb1b304c39e8aab3d7217edea362d5bb9190f79c6c9', 1, '2026-05-27 10:21:47.608', NULL, NULL, NULL, NULL, 1000),
('6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', 'Lords Cricket Ground', 'St Johns Wood', 'The home of cricket with premium nets.', 'London', 'LDN', 'Cricket', NULL, NULL, '[]', '[]', 4.5, '[]', '2026-05-26 07:07:38.822', '2026-05-27 10:21:57.134', '23:00', NULL, NULL, NULL, 1, 0, '06:00', '[]', NULL, '9975bebcdf801d03d0bcb9d28e8bfcf1ff3942ac55c20f87', 1, '2026-05-27 10:21:57.133', NULL, NULL, NULL, NULL, 1000),
('79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', 'Old Trafford Turf', 'Manchester Street', 'The theater of dreams for local footballers.', 'Manchester', 'Manc', 'Football', NULL, NULL, '[]', '[]', 4.5, '[]', '2026-05-26 07:07:38.808', '2026-05-26 16:18:12.082', '23:00', NULL, NULL, NULL, 1, 0, '06:00', '[]', NULL, 'd3f54db0687545cf77cef89ed7c1db0d2891560ad6ad44b3', 1, '2026-05-26 16:18:12.064', NULL, NULL, NULL, NULL, 1000),
('a2ed5503-3316-45ba-97a8-55bb028e3948', 'demo turf', 'vikas khand 3 gomti nagar', '', 'lucknow', 'State', 'Football', NULL, NULL, '[]', '[]', 4.5, '[]', '2026-05-26 07:09:39.300', '2026-05-26 11:29:04.664', '23:00', NULL, NULL, NULL, 1, 0, '06:00', '[]', NULL, '142c6ace197069bf649729e8ff7cc892637db44f757be74c', 1, '2026-05-26 11:29:04.663', NULL, NULL, NULL, NULL, 1000),
('e2344396-28c0-4d26-8034-72953f1a8e59', 'Skyline Terrace Pitch', 'Andheri West', 'Elite rooftop pitch with panoramic city views and professional drainage system.', 'Mumbai', 'Maharashtra', 'Football', NULL, NULL, '[\"FOOTBALL\"]', '[\"Locker Room\",\"Parking\",\"Beverages\"]', 4.5, '[\"https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80\"]', '2026-05-26 07:07:23.321', '2026-05-26 16:18:20.375', '22:00', 'skyline@turfs.com', '8877665544', NULL, 1, 0, '07:00', '[\"Proper sports attire is mandatory.\",\"Cancellations require 6 hours notice.\"]', NULL, 'adc61b69998a39a3dd817e351c409cfa273c9bceb7f90730', 1, '2026-05-26 16:18:20.373', NULL, NULL, NULL, NULL, 1000);

-- --------------------------------------------------------

--
-- Table structure for table `turfavailabilityoverride`
--

CREATE TABLE `turfavailabilityoverride` (
  `id` varchar(36) NOT NULL,
  `turfId` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `reason` text NOT NULL,
  `type` enum('HOLIDAY','MAINTENANCE','SPECIAL_EVENT','WEATHER_BLOCK') NOT NULL,
  `slots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`slots`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `turfpricing`
--

CREATE TABLE `turfpricing` (
  `id` varchar(36) NOT NULL,
  `turfId` varchar(36) NOT NULL,
  `dayType` enum('WEEKDAY','WEEKEND','HOLIDAY') NOT NULL,
  `timeSlot` enum('MORNING','AFTERNOON','EVENING','NIGHT') NOT NULL,
  `sportType` enum('CRICKET','FOOTBALL','TENNIS','BADMINTON','BASKETBALL','VOLLEYBALL') DEFAULT NULL,
  `price` double NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `turfslot`
--

CREATE TABLE `turfslot` (
  `id` varchar(36) NOT NULL,
  `turfId` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `startTime` varchar(10) NOT NULL,
  `endTime` varchar(10) NOT NULL,
  `status` enum('AVAILABLE','BOOKED','BLOCKED','MAINTENANCE','ON_HOLD') NOT NULL DEFAULT 'AVAILABLE',
  `price` double NOT NULL,
  `bufferBefore` int(11) NOT NULL DEFAULT 0,
  `bufferAfter` int(11) NOT NULL DEFAULT 15,
  `discount` double NOT NULL DEFAULT 0,
  `isPeakHour` tinyint(1) NOT NULL DEFAULT 0,
  `maxPlayers` int(11) NOT NULL DEFAULT 10,
  `notes` text DEFAULT NULL,
  `sportType` enum('CRICKET','FOOTBALL','TENNIS','BADMINTON','BASKETBALL','VOLLEYBALL') NOT NULL DEFAULT 'FOOTBALL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `turfslot`
--

INSERT INTO `turfslot` (`id`, `turfId`, `date`, `startTime`, `endTime`, `status`, `price`, `bufferBefore`, `bufferAfter`, `discount`, `isPeakHour`, `maxPlayers`, `notes`, `sportType`) VALUES
('00505bca-7513-4356-88b5-ecbfd3db5bec', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '2026-05-22', '10:00', '11:00', 'BOOKED', 1500, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('0d766e0a-38f4-418e-9270-2a39bd6697c9', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', '2026-05-26', '07:00 PM', '07:59 PM', 'AVAILABLE', 2646, 0, 15, 10, 0, 12, NULL, 'CRICKET'),
('0f196453-df2a-4cba-94cb-7d6a91f79168', '19e1f5f2-24ac-417e-ac84-e262e5640db9', '2026-05-26', '06:00', '07:00', 'BOOKED', 800, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('14e1b680-3cb3-43aa-af4e-06fde1d9a911', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '2026-05-24', '12:00', '13:00', 'BOOKED', 1500, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('16e42506-b3f4-4b05-bb48-0c55bd2bd959', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-20', '11:00', '12:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('1d011055-6f3b-44db-89d0-caded70ca75e', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-26', '07:00 PM', '07:59 PM', 'AVAILABLE', 2905, 0, 15, 10, 0, 12, NULL, 'FOOTBALL'),
('2bd9550b-ea95-4215-8e5e-f669156dc80a', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', '2026-05-26', '08:00 PM', '08:59 PM', 'AVAILABLE', 3280, 0, 15, 10, 1, 12, NULL, 'CRICKET'),
('2df0fdb1-cccb-4188-b7e9-776d189902bd', 'a2ed5503-3316-45ba-97a8-55bb028e3948', '2026-05-25', '04:00', '06:00', 'AVAILABLE', 1100, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('32e47679-a0b7-409e-8d6b-8ca9058991db', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-25', '06:00 PM', '06:59 PM', 'AVAILABLE', 2929, 0, 15, 10, 0, 12, NULL, 'FOOTBALL'),
('364bf004-dcfd-4132-976c-ac284e507746', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', '2026-05-25', '06:00 PM', '06:59 PM', 'AVAILABLE', 3187, 0, 15, 10, 0, 12, NULL, 'CRICKET'),
('3eb9400b-3e68-4723-9a13-a8a038d90036', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-26', '06:00', '07:00', 'AVAILABLE', 800, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('49200840-0cf7-4e0a-8cfa-c269204e2247', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-25', '07:00 PM', '07:59 PM', 'AVAILABLE', 2544, 0, 15, 10, 0, 12, NULL, 'FOOTBALL'),
('4f682c96-848d-453f-9c30-cd10b3bdd81d', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-24', '11:00', '12:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('5029b61f-a2fc-49d7-888d-cfaa47067c5f', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-25', '08:00 PM', '08:59 PM', 'AVAILABLE', 2603, 0, 15, 10, 1, 12, NULL, 'FOOTBALL'),
('523acf78-64b9-438b-9e97-0d38f4657197', 'e2344396-28c0-4d26-8034-72953f1a8e59', '2026-05-26', '07:00 PM', '07:59 PM', 'AVAILABLE', 2642, 0, 15, 10, 0, 12, NULL, 'FOOTBALL'),
('5b49da4d-70ff-4f34-ad29-e2aa2eb455f6', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', '2026-05-25', '09:00 PM', '10:00 PM', 'AVAILABLE', 2544, 0, 15, 10, 1, 12, NULL, 'CRICKET'),
('6238386a-4999-4101-b166-5b81dc965b9e', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-26', '06:00 PM', '06:59 PM', 'BOOKED', 3430, 0, 15, 10, 0, 12, NULL, 'FOOTBALL'),
('6306a22d-cd4e-4458-833e-00276546e38a', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-21', '11:00', '12:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('651a3bab-e058-47aa-87bc-a1637e6c10c2', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '2026-05-22', '11:00', '12:00', 'BOOKED', 1500, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('678c947d-2564-4c95-881c-a350280ab35a', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', '2026-05-25', '07:00 PM', '07:59 PM', 'AVAILABLE', 2554, 0, 15, 10, 0, 12, NULL, 'CRICKET'),
('6d7c32fc-08fc-48a2-8c55-e230bfff4e8f', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-27', '08:00 AM', '09:00 AM', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('78864bff-dc23-4afa-ae2e-8c18d72bdd41', 'a2ed5503-3316-45ba-97a8-55bb028e3948', '2026-05-26', '08:00', '10:00', 'BOOKED', 1100, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('7be76109-7dd4-4773-b044-6bb7d01f9fb1', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', '2026-05-26', '06:00 PM', '06:59 PM', 'AVAILABLE', 3130, 0, 15, 10, 0, 12, NULL, 'CRICKET'),
('82a32bd0-7ef5-452e-9def-f2363b461e0e', 'e2344396-28c0-4d26-8034-72953f1a8e59', '2026-05-26', '08:00 PM', '08:59 PM', 'AVAILABLE', 2546, 0, 15, 10, 1, 12, NULL, 'FOOTBALL'),
('87ed10a3-be0a-472e-ac29-9afd97b5acca', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-25', '10:00', '11:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('8f3115b7-c93b-41ca-b4ed-581938bbf4f8', 'e2344396-28c0-4d26-8034-72953f1a8e59', '2026-05-25', '09:00 PM', '10:00 PM', 'AVAILABLE', 3067, 0, 15, 10, 1, 12, NULL, 'FOOTBALL'),
('9728c4f6-bdfa-4b46-9840-d18aead5254b', 'e2344396-28c0-4d26-8034-72953f1a8e59', '2026-05-25', '06:00 PM', '06:59 PM', 'AVAILABLE', 2801, 0, 15, 10, 0, 12, NULL, 'FOOTBALL'),
('99c99d63-b139-4423-8cdc-6d840784e22b', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', '2026-05-25', '08:00 PM', '08:59 PM', 'AVAILABLE', 2606, 0, 15, 10, 1, 12, NULL, 'CRICKET'),
('9ee721e9-14bd-426a-9660-bdfca1d9d1ee', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-26', '09:00 PM', '10:00 PM', 'BOOKED', 2603, 0, 15, 10, 1, 12, NULL, 'FOOTBALL'),
('a37b0d86-df71-42da-95b3-e94b1f64ac7b', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '2026-05-19', '10:00', '11:00', 'BOOKED', 1500, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('a790c614-2cd6-4210-9f94-2323ca5486fe', '19e1f5f2-24ac-417e-ac84-e262e5640db9', '2026-05-27', '06:00', '07:00', 'BOOKED', 800, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('a7dd7a73-fb06-4e59-a22b-f50eafa720f2', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '2026-05-21', '10:00', '11:00', 'BOOKED', 1500, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('aaa28b1d-4f4e-4a76-93da-fc09ae8acce9', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-25', '09:00 PM', '10:00 PM', 'AVAILABLE', 2550, 0, 15, 10, 1, 12, NULL, 'FOOTBALL'),
('ac785769-d2c2-4241-9364-5330c840f61e', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-24', '10:00', '11:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('af071cc5-aa53-4628-8302-a744bb16a68b', '19e1f5f2-24ac-417e-ac84-e262e5640db9', '2026-05-26', '08:00', '10:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('b2c40767-5e9c-4421-baaf-19f62443ba35', 'a2ed5503-3316-45ba-97a8-55bb028e3948', '2026-05-25', '06:00', '07:00', 'AVAILABLE', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('bf508521-f1e5-4b50-b111-6c042e0a35e5', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-20', '10:00', '11:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('bf6b3502-3f72-4c08-9632-4be7a4c7e672', 'e2344396-28c0-4d26-8034-72953f1a8e59', '2026-05-26', '09:00 PM', '10:00 PM', 'AVAILABLE', 2875, 0, 15, 10, 1, 12, NULL, 'FOOTBALL'),
('c009d5e9-678a-41f7-9bb2-fc777ecaf309', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-26', '08:00 PM', '08:59 PM', 'BOOKED', 2781, 0, 15, 10, 1, 12, NULL, 'FOOTBALL'),
('c3dee134-7b3b-4a0a-8985-6d0051e19e7c', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-22', '12:00', '13:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('c46bf224-798f-422d-b53a-190ba11a0412', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '2026-05-21', '12:00', '13:00', 'BOOKED', 1500, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('d13e6172-acef-4353-860f-d5e9092cdf7c', 'e2344396-28c0-4d26-8034-72953f1a8e59', '2026-05-25', '07:00 PM', '07:59 PM', 'AVAILABLE', 3461, 0, 15, 10, 0, 12, NULL, 'FOOTBALL'),
('d2ae1af1-2c89-410e-b49e-404dfc680885', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '2026-05-25', '12:00', '13:00', 'BOOKED', 1500, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('d7d99893-35ba-4457-8bfd-0299d188239e', '51bee5c7-3e6d-48d1-8828-a7231eef9ac5', '2026-05-26', '09:00 PM', '10:00 PM', 'AVAILABLE', 2563, 0, 15, 10, 1, 12, NULL, 'CRICKET'),
('dab0d67b-cd7f-436b-bbb9-9129b3602f29', '19e1f5f2-24ac-417e-ac84-e262e5640db9', '2026-05-27', '16:00', '17:00', 'BOOKED', 800, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('dbb883d5-a929-4890-bd2d-12c942a47b4d', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-23', '12:00', '13:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('ded677a0-beed-4393-ae32-40a6b77b3cbb', 'e2344396-28c0-4d26-8034-72953f1a8e59', '2026-05-25', '08:00 PM', '08:59 PM', 'AVAILABLE', 2789, 0, 15, 10, 1, 12, NULL, 'FOOTBALL'),
('e0a063ab-f89f-4b40-8076-f53cb1721635', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-23', '11:00', '12:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('e19e12bc-b3a2-4f92-bdb2-cbd5829c22a5', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-25', '11:00', '12:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('e3589eb7-f132-4ee0-b049-4b6c2f396f47', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-19', '11:00', '12:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('e447d044-8c0d-4f52-a27f-48eb35d510e2', '2c2f9127-805b-4892-8a1a-ad1cc06c5412', '2026-05-24', '06:00', '07:00', 'AVAILABLE', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('f3f43baa-6c5d-4d54-9e92-89a550b3e3f3', '79e5f8d8-6dc7-4192-80e8-41cfbca3d1e4', '2026-05-23', '10:00', '11:00', 'BOOKED', 1200, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('f51e7f80-b535-46ce-b0d6-ed0e30fe114a', '6a21c0c2-4d4c-4e9a-b24d-6a9e76b3db09', '2026-05-20', '12:00', '13:00', 'BOOKED', 1500, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('f62d0e16-48b5-43c6-9afb-47dd3db97d78', 'e2344396-28c0-4d26-8034-72953f1a8e59', '2026-05-26', '06:00 PM', '06:59 PM', 'AVAILABLE', 2797, 0, 15, 10, 0, 12, NULL, 'FOOTBALL'),
('fb292145-9717-4b40-abd9-3996c0e034a8', 'a2ed5503-3316-45ba-97a8-55bb028e3948', '2026-05-25', '08:00', '10:00', 'AVAILABLE', 1000, 0, 15, 0, 0, 10, NULL, 'FOOTBALL'),
('fd9e51f4-d4f0-408c-80ff-dc8ebebe8df8', 'a2ed5503-3316-45ba-97a8-55bb028e3948', '2026-05-26', '06:00', '07:00', 'BOOKED', 800, 0, 15, 0, 0, 10, NULL, 'FOOTBALL');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `avatar` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `fcmToken` text DEFAULT NULL,
  `matchesPlayed` int(11) NOT NULL DEFAULT 0,
  `rating` double NOT NULL DEFAULT 5,
  `xp` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `bio` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `preferredSport` enum('CRICKET','FOOTBALL','TENNIS','BADMINTON','BASKETBALL','VOLLEYBALL') DEFAULT NULL,
  `totalSpend` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `name`, `avatar`, `phone`, `fcmToken`, `matchesPlayed`, `rating`, `xp`, `createdAt`, `updatedAt`, `bio`, `dob`, `gender`, `isActive`, `isVerified`, `preferredSport`, `totalSpend`) VALUES
('03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', 'dy81114@gmail.com', '$2b$10$6MCCc7SlrFQIKHR3tGNFD.N7YSg9hz7XLJe.7YxQf8Csif3kXjFbC', 'Devendra Yadav', NULL, '6392178640', NULL, 9, 5, 450, '2026-05-26 10:55:10.395', '2026-05-27 12:01:03.482', NULL, NULL, NULL, 1, 0, NULL, 0),
('6ecbee09-285f-4454-8c24-78e7e4045ede', 'amanktyrrr@gmail.com', '$2b$10$h74HDbbM97099ioxnHKpKORP3JHMvYRf2lcq3m5.Bod12veJ..6Ce', 'Aman', NULL, NULL, NULL, 1, 5, 50, '2026-05-27 10:56:58.672', '2026-05-27 10:59:21.448', NULL, NULL, NULL, 1, 0, NULL, 0),
('8078200b-c7c4-408b-811b-179cb0d3a781', 'player1@example.com', NULL, 'John Doe', NULL, '1234567890', NULL, 0, 5, 0, '2026-05-26 07:07:38.774', '2026-05-26 07:07:38.774', NULL, NULL, NULL, 1, 0, NULL, 0),
('9cd25fdc-9e9c-4b7a-b0c9-7413af3d1f41', 'player2@example.com', NULL, 'Jane Smith', NULL, '0987654321', NULL, 0, 5, 0, '2026-05-26 07:07:38.799', '2026-05-26 07:07:38.799', NULL, NULL, NULL, 1, 0, NULL, 0),
('test-user-id', 'test@turf.com', 'password123', 'Test Player', NULL, '9876543210', NULL, 0, 5, 0, '2026-05-26 07:07:23.191', '2026-05-26 07:07:23.191', 'Avid football player looking for weekend 5v5 matches.', '1998-05-15', 'MALE', 1, 1, 'FOOTBALL', 5000);

-- --------------------------------------------------------

--
-- Table structure for table `wallet`
--

CREATE TABLE `wallet` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallet`
--

INSERT INTO `wallet` (`id`, `userId`, `balance`, `createdAt`, `updatedAt`, `currency`, `isActive`) VALUES
('4c2d65e3-a619-4808-89f6-710fae4a78ec', '6ecbee09-285f-4454-8c24-78e7e4045ede', 100, '2026-05-27 10:56:58.672', '2026-05-27 11:00:26.578', 'INR', 1),
('4e800313-25b0-45f6-97a4-9f95cbe9654f', 'test-user-id', 1500, '2026-05-26 07:07:23.191', '2026-05-26 07:07:23.191', 'INR', 1),
('71cb90d4-e39a-4ce8-aea6-6c94c2860a68', '03bb8fc4-aa47-48ab-922e-7ab3445cb1d9', 1200, '2026-05-26 10:55:10.395', '2026-05-26 15:35:49.138', 'INR', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addonproduct`
--
ALTER TABLE `addonproduct`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `adminpaneluser`
--
ALTER TABLE `adminpaneluser`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `AdminPanelUser_email_key` (`email`),
  ADD KEY `AdminPanelUser_turfId_fkey` (`turfId`);

--
-- Indexes for table `banner`
--
ALTER TABLE `banner`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Booking_slotId_key` (`slotId`),
  ADD UNIQUE KEY `Booking_bookingNumber_key` (`bookingNumber`),
  ADD KEY `Booking_userId_idx` (`userId`),
  ADD KEY `Booking_turfId_idx` (`turfId`),
  ADD KEY `Booking_status_idx` (`status`),
  ADD KEY `Booking_teamId_idx` (`teamId`),
  ADD KEY `Booking_challengeId_fkey` (`challengeId`);

--
-- Indexes for table `bookingaddon`
--
ALTER TABLE `bookingaddon`
  ADD PRIMARY KEY (`id`),
  ADD KEY `BookingAddOn_bookingId_fkey` (`bookingId`),
  ADD KEY `BookingAddOn_addOnProductId_fkey` (`addOnProductId`);

--
-- Indexes for table `cancellationpolicy`
--
ALTER TABLE `cancellationpolicy`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CancellationPolicy_turfId_key` (`turfId`);

--
-- Indexes for table `cancellationrequest`
--
ALTER TABLE `cancellationrequest`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CancellationRequest_bookingId_key` (`bookingId`),
  ADD KEY `CancellationRequest_userId_idx` (`userId`),
  ADD KEY `CancellationRequest_refundStatus_idx` (`refundStatus`);

--
-- Indexes for table `challenge`
--
ALTER TABLE `challenge`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Challenge_shareCode_key` (`shareCode`),
  ADD KEY `Challenge_creatorId_idx` (`creatorId`),
  ADD KEY `Challenge_status_idx` (`status`),
  ADD KEY `Challenge_sportType_idx` (`sportType`),
  ADD KEY `Challenge_shareCode_idx` (`shareCode`),
  ADD KEY `Challenge_challengerTeamId_fkey` (`challengerTeamId`),
  ADD KEY `Challenge_opponentId_fkey` (`opponentId`),
  ADD KEY `Challenge_opponentTeamId_fkey` (`opponentTeamId`),
  ADD KEY `Challenge_turfId_fkey` (`turfId`),
  ADD KEY `Challenge_slotId_fkey` (`slotId`);

--
-- Indexes for table `coupon`
--
ALTER TABLE `coupon`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Coupon_code_key` (`code`);

--
-- Indexes for table `favorite`
--
ALTER TABLE `favorite`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Favorite_userId_turfId_key` (`userId`,`turfId`),
  ADD KEY `Favorite_turfId_fkey` (`turfId`);

--
-- Indexes for table `groupbooking`
--
ALTER TABLE `groupbooking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `GroupBooking_bookingId_key` (`bookingId`),
  ADD UNIQUE KEY `GroupBooking_inviteCode_key` (`inviteCode`),
  ADD KEY `GroupBooking_captainId_fkey` (`captainId`);

--
-- Indexes for table `groupmember`
--
ALTER TABLE `groupmember`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `GroupMember_groupId_userId_key` (`groupId`,`userId`),
  ADD KEY `GroupMember_userId_fkey` (`userId`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_userId_isRead_idx` (`userId`,`isRead`);

--
-- Indexes for table `paymentdetail`
--
ALTER TABLE `paymentdetail`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PaymentDetail_bookingId_key` (`bookingId`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Review_bookingId_key` (`bookingId`),
  ADD KEY `Review_turfId_idx` (`turfId`),
  ADD KEY `Review_userId_idx` (`userId`);

--
-- Indexes for table `searchhistory`
--
ALTER TABLE `searchhistory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SearchHistory_userId_idx` (`userId`);

--
-- Indexes for table `supportticket`
--
ALTER TABLE `supportticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SupportTicket_userId_fkey` (`userId`);

--
-- Indexes for table `systemauditlog`
--
ALTER TABLE `systemauditlog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `team`
--
ALTER TABLE `team`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Team_captainId_idx` (`captainId`),
  ADD KEY `Team_turfId_fkey` (`turfId`);

--
-- Indexes for table `teammember`
--
ALTER TABLE `teammember`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TeamMember_teamId_email_key` (`teamId`,`email`),
  ADD KEY `TeamMember_userId_idx` (`userId`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Transaction_walletId_fkey` (`walletId`);

--
-- Indexes for table `turf`
--
ALTER TABLE `turf`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Turf_entryQrToken_key` (`entryQrToken`),
  ADD KEY `Turf_latitude_longitude_idx` (`latitude`,`longitude`);

--
-- Indexes for table `turfavailabilityoverride`
--
ALTER TABLE `turfavailabilityoverride`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TurfAvailabilityOverride_turfId_date_key` (`turfId`,`date`),
  ADD KEY `TurfAvailabilityOverride_turfId_date_idx` (`turfId`,`date`);

--
-- Indexes for table `turfpricing`
--
ALTER TABLE `turfpricing`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TurfPricing_turfId_dayType_timeSlot_sportType_key` (`turfId`,`dayType`,`timeSlot`,`sportType`);

--
-- Indexes for table `turfslot`
--
ALTER TABLE `turfslot`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TurfSlot_turfId_date_startTime_key` (`turfId`,`date`,`startTime`),
  ADD KEY `TurfSlot_turfId_date_status_idx` (`turfId`,`date`,`status`),
  ADD KEY `TurfSlot_status_idx` (`status`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `wallet`
--
ALTER TABLE `wallet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Wallet_userId_key` (`userId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `adminpaneluser`
--
ALTER TABLE `adminpaneluser`
  ADD CONSTRAINT `AdminPanelUser_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `Booking_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenge` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `turfslot` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `bookingaddon`
--
ALTER TABLE `bookingaddon`
  ADD CONSTRAINT `BookingAddOn_addOnProductId_fkey` FOREIGN KEY (`addOnProductId`) REFERENCES `addonproduct` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `BookingAddOn_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cancellationpolicy`
--
ALTER TABLE `cancellationpolicy`
  ADD CONSTRAINT `CancellationPolicy_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cancellationrequest`
--
ALTER TABLE `cancellationrequest`
  ADD CONSTRAINT `CancellationRequest_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CancellationRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `challenge`
--
ALTER TABLE `challenge`
  ADD CONSTRAINT `Challenge_challengerTeamId_fkey` FOREIGN KEY (`challengerTeamId`) REFERENCES `team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Challenge_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Challenge_opponentId_fkey` FOREIGN KEY (`opponentId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Challenge_opponentTeamId_fkey` FOREIGN KEY (`opponentTeamId`) REFERENCES `team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Challenge_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `turfslot` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Challenge_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `favorite`
--
ALTER TABLE `favorite`
  ADD CONSTRAINT `Favorite_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `groupbooking`
--
ALTER TABLE `groupbooking`
  ADD CONSTRAINT `GroupBooking_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `GroupBooking_captainId_fkey` FOREIGN KEY (`captainId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `groupmember`
--
ALTER TABLE `groupmember`
  ADD CONSTRAINT `GroupMember_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groupbooking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `GroupMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `paymentdetail`
--
ALTER TABLE `paymentdetail`
  ADD CONSTRAINT `PaymentDetail_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `Review_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Review_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `searchhistory`
--
ALTER TABLE `searchhistory`
  ADD CONSTRAINT `SearchHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `supportticket`
--
ALTER TABLE `supportticket`
  ADD CONSTRAINT `SupportTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `team`
--
ALTER TABLE `team`
  ADD CONSTRAINT `Team_captainId_fkey` FOREIGN KEY (`captainId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Team_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `teammember`
--
ALTER TABLE `teammember`
  ADD CONSTRAINT `TeamMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TeamMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `Transaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `wallet` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `turfavailabilityoverride`
--
ALTER TABLE `turfavailabilityoverride`
  ADD CONSTRAINT `TurfAvailabilityOverride_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `turfpricing`
--
ALTER TABLE `turfpricing`
  ADD CONSTRAINT `TurfPricing_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `turfslot`
--
ALTER TABLE `turfslot`
  ADD CONSTRAINT `TurfSlot_turfId_fkey` FOREIGN KEY (`turfId`) REFERENCES `turf` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wallet`
--
ALTER TABLE `wallet`
  ADD CONSTRAINT `Wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
