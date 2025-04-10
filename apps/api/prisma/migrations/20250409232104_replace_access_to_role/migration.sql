/*
  Warnings:

  - You are about to drop the column `access` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Administrator', 'Manager', 'Guest');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "access",
ADD COLUMN     "role" "Role" DEFAULT 'Guest';

-- DropEnum
DROP TYPE "Access";
