INSERT INTO beach (name,district,lat,lon,status) VALUES
('해운대해수욕장','부산 해운대구',35.1587,129.1604,'혼잡'),
('광안리해수욕장','부산 수영구',35.1535,129.1184,'여유'),
('송정해수욕장','부산 해운대구',35.1780,129.2019,'혼잡'),
('다대포해수욕장','부산 사하구',35.0454,128.9665,'혼잡'),
('송도해수욕장','부산 서구',35.0790,129.0203,'보통'),
('일광해수욕장','부산 기장군',35.2669,129.2365,'혼잡');

INSERT INTO beach_tag (beach_id,tag) VALUES
(1,'popular'),(1,'festival'),
(2,'trending'),
(3,'popular'),
(4,'festival'),
(5,'trending'),
(6,'popular');

INSERT INTO favorite (user_id,beach_id) VALUES (1,2),(1,5);

INSERT INTO users (email, password, name, role, auth_provider)
VALUES ('admin@beachcomplex.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'ADMIN', 'EMAIL')
ON CONFLICT (email) DO NOTHING;
