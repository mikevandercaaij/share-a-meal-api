DROP DATABASE IF EXISTS `share-a-meal`;
CREATE DATABASE `share-a-meal`;
DROP DATABASE IF EXISTS `share-a-meal-testdb`;
CREATE DATABASE `share-a-meal-testdb`;

CREATE USER 'share-a-meal-user'@'localhost' IDENTIFIED BY 'secret';
CREATE USER 'share-a-meal-user'@'%' IDENTIFIED BY 'secret';

GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal`.* TO 'share-a-meal-user'@'%';
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal-testdb`.* TO 'share-a-meal-user'@'%';

USE `share-a-meal`;