CREATE DATABASE IF NOT EXISTS tabel
#
CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(40) NOT  NULL COMMENT 'SHA1(password+salt) in HEX',
    nickname VARCHAR(50) NOT NULL COMMENT 'Used only for visual representation,not for login',
    created_at DATETIME NOT Null DEFAULT CURRENT_TIMESTAMP,
    index e (email),
    index p (password)
	);


#
CREATE TABLE IF NOT EXISTS messages(
     id INT AUTO_INCREMENT PRIMARY KEY,
     txt TEXT NOT NULL COMMENT 'Message body',
     receiver_id INT NOT NULL,
     sender_id INT NOT NULL,
     status enum('sent','arrived','SEEN') NOT NULL comment 'Used for satus arrows like WhatsApp',
     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     index s (status),
     foreign key (receiver_id) references users(id) ON DELETE CASCADE,
     foreign key (sender_id) references users(id)  ON DELETE CASCADE
    
);



