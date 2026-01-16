# Pet Adoption Center System - Database Initialization

## Prerequisites

- MySQL 8.0+ installed and running
- MySQL client or MySQL Workbench

## Database Setup

Run the following SQL commands to create and initialize the database:

```sql
-- Create Database

CREATE DATABASE IF NOT EXISTS pet_adoption_center;
USE pet_adoption_center;

-- 1. PET TABLE
CREATE TABLE Pet (
    Pet_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_Name VARCHAR(50) NOT NULL,
    Species VARCHAR(30) NOT NULL,
    Breed VARCHAR(50) NOT NULL,
    Age VARCHAR(20) NOT NULL,
    Gender ENUM('Male', 'Female') NOT NULL,
    Color VARCHAR(50) NOT NULL,
    Date_Arrived DATE NOT NULL,
    Spayed_Neutered ENUM('Yes', 'No') NOT NULL,
    Temperament VARCHAR(100) NOT NULL,
    Special_Needs TEXT,
    Photo_URL VARCHAR(255),
    Status ENUM('Available', 'Adopted', 'Reserved', 'Medical Hold') NOT NULL
);

-- 2. ADOPTER TABLE
CREATE TABLE Adopter (
    Adopter_ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Full_Name VARCHAR(100) NOT NULL,
    Contact_No VARCHAR(15) NOT NULL,
    Address VARCHAR(200) NOT NULL,
    Housing_Type ENUM('House', 'Apartment', 'Condo', 'Farm') NOT NULL,
    Has_Other_Pets ENUM('Yes', 'No') NOT NULL,
    Has_Children ENUM('Yes', 'No') NOT NULL,
    Experience_Level ENUM('First-time', 'Experienced') NOT NULL
);

-- 3. ADOPTION TABLE
CREATE TABLE Adoption (
    Adoption_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_ID INT NOT NULL,
    Adopter_ID INT NOT NULL,
    Application_Date DATE NOT NULL DEFAULT (CURDATE()),
    Adoption_Date DATE,
    Adoption_Fee DECIMAL(10,2),
    Contract_Signed ENUM('Yes', 'No') NOT NULL,
    Status ENUM('Completed', 'Pending', 'Returned', 'Cancelled') NOT NULL,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE,
    FOREIGN KEY (Adopter_ID) REFERENCES Adopter(Adopter_ID) ON DELETE CASCADE
);

-- 4. VETERINARY_VISIT TABLE
CREATE TABLE Veterinary_Visit (
    Visit_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_ID INT NOT NULL,
    Visit_Date DATE NOT NULL,
    Veterinarian_Name VARCHAR(100) NOT NULL,
    Visit_Type ENUM('Checkup', 'Vaccination', 'Surgery', 'Treatment', 'Emergency') NOT NULL,
    Weight DECIMAL(5,2),
    Temperature DECIMAL(4,2),
    Diagnosis TEXT,
    General_Notes TEXT,
    Procedure_Cost DECIMAL(10,2) NOT NULL,
    Next_Visit_Date DATE,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE
);

-- 5. VACCINATION TABLE
CREATE TABLE Vaccination (
    Vaccination_ID INT AUTO_INCREMENT PRIMARY KEY,
    Visit_ID INT NOT NULL,
    Vaccine_Name VARCHAR(100) NOT NULL,
    Date_Administered DATE,
    Administered_By VARCHAR(100),
    Manufacturer VARCHAR(50),
    Next_Due_Date DATE,
    Site VARCHAR(50),
    Reaction TEXT,
    Status ENUM('Completed', 'Scheduled', 'Overdue') NOT NULL,
    Cost DECIMAL(10,2),
    FOREIGN KEY (Visit_ID) REFERENCES Veterinary_Visit(Visit_ID) ON DELETE CASCADE
);

-- 6. FAVORITE TABLE
CREATE TABLE Favorite (
    Favorite_ID INT AUTO_INCREMENT PRIMARY KEY,
    Adopter_ID INT NOT NULL,
    Pet_ID INT NOT NULL,
    Date_Added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    FOREIGN KEY (Adopter_ID) REFERENCES Adopter(Adopter_ID) ON DELETE CASCADE,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE,
    UNIQUE KEY Unique_Favorite (Adopter_ID, Pet_ID)
);

-- 7. ADMIN TABLE
CREATE TABLE Admin (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Full_Name VARCHAR(100) NOT NULL
);

-- Sample Pets (25 pets for better demo data - photos match breeds)
INSERT INTO Pet (Pet_Name, Species, Breed, Age, Gender, Color, Date_Arrived, Spayed_Neutered, Temperament, Special_Needs, Photo_URL, Status) VALUES
('Buddy', 'Dog', 'Golden Retriever', '3 years', 'Male', 'Golden', '2025-01-15', 'Yes', 'Friendly', NULL, 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', 'Available'),
('Luna', 'Cat', 'Persian', '2 years', 'Female', 'White', '2025-02-20', 'Yes', 'Calm', NULL, 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400', 'Available'),
('Max', 'Dog', 'German Shepherd', '4 years', 'Male', 'Black and Tan', '2025-01-10', 'Yes', 'Loyal', NULL, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', 'Available'),
('Whiskers', 'Cat', 'Tabby', '1 year', 'Male', 'Orange Tabby', '2025-03-01', 'No', 'Playful', NULL, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400', 'Available'),
('Bella', 'Dog', 'Labrador', '2 years', 'Female', 'Chocolate', '2025-02-10', 'Yes', 'Gentle', NULL, 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=400', 'Reserved'),
('Mittens', 'Cat', 'Siamese', '3 years', 'Female', 'Cream and Brown', '2025-01-25', 'Yes', 'Social', NULL, 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400', 'Available'),
('Rocky', 'Dog', 'Bulldog', '5 years', 'Male', 'Brindle', '2025-02-28', 'Yes', 'Calm', 'Requires special diet', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', 'Medical Hold'),
('Shadow', 'Cat', 'Black Shorthair', '4 years', 'Male', 'Black', '2025-03-05', 'Yes', 'Independent', NULL, 'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400', 'Available'),
('Daisy', 'Dog', 'Beagle', '1 year', 'Female', 'Tricolor', '2025-03-10', 'No', 'Energetic', NULL, 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=400', 'Available'),
('Oliver', 'Cat', 'Maine Coon', '2 years', 'Male', 'Brown Tabby', '2025-02-15', 'Yes', 'Gentle', NULL, 'https://images.unsplash.com/photo-1615796153287-98eacf0abb13?w=400', 'Available'),
('Charlie', 'Dog', 'Mixed Breed', '6 years', 'Male', 'Brown', '2024-12-01', 'Yes', 'Quiet', NULL, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 'Adopted'),
('Coco', 'Dog', 'Poodle', '2 years', 'Female', 'White', '2025-01-05', 'Yes', 'Intelligent', NULL, 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400', 'Available'),
('Simba', 'Cat', 'Orange Tabby', '1 year', 'Male', 'Orange', '2025-01-08', 'No', 'Adventurous', NULL, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 'Available'),
('Rosie', 'Dog', 'Shih Tzu', '4 years', 'Female', 'White and Brown', '2025-01-12', 'Yes', 'Affectionate', NULL, 'https://images.unsplash.com/photo-1587559070757-f72a388edbba?w=400', 'Available'),
('Milo', 'Cat', 'British Shorthair', '3 years', 'Male', 'Gray', '2025-01-18', 'Yes', 'Relaxed', NULL, 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=400', 'Available'),
('Duke', 'Dog', 'Rottweiler', '3 years', 'Male', 'Black and Tan', '2025-01-20', 'Yes', 'Protective', NULL, 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400', 'Available'),
('Nala', 'Cat', 'Ragdoll', '2 years', 'Female', 'Seal Point', '2025-01-22', 'Yes', 'Docile', NULL, 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400', 'Reserved'),
('Bear', 'Dog', 'Husky', '2 years', 'Male', 'Gray and White', '2025-01-25', 'Yes', 'Energetic', NULL, 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400', 'Available'),
('Cleo', 'Cat', 'Abyssinian', '1 year', 'Female', 'Ruddy', '2025-01-28', 'No', 'Curious', NULL, 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400', 'Available'),
('Thor', 'Dog', 'Great Dane', '4 years', 'Male', 'Fawn', '2024-12-15', 'Yes', 'Gentle Giant', NULL, 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400', 'Adopted'),
('Ginger', 'Cat', 'Scottish Fold', '2 years', 'Female', 'Cream', '2024-12-20', 'Yes', 'Sweet', NULL, 'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?w=400', 'Adopted'),
('Rex', 'Dog', 'Doberman', '3 years', 'Male', 'Black', '2025-01-02', 'Yes', 'Alert', NULL, 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400', 'Available'),
('Pepper', 'Cat', 'Tuxedo', '1 year', 'Female', 'Black and White', '2025-01-03', 'No', 'Playful', NULL, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 'Available'),
('Cooper', 'Dog', 'Cocker Spaniel', '5 years', 'Male', 'Golden', '2024-11-15', 'Yes', 'Friendly', NULL, 'https://images.unsplash.com/photo-1530041539828-114de669390e?w=400', 'Available'),
('Lily', 'Cat', 'Calico', '3 years', 'Female', 'Tricolor', '2024-11-20', 'Yes', 'Independent', NULL, 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400', 'Available');

-- Sample Adopters (password is 'password123' hashed with bcrypt) - 10 adopters
INSERT INTO Adopter (Email, Password_Hash, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level) VALUES
('john.doe@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'John Doe', '09171234567', '123 Main St, Manila', 'House', 'No', 'Yes', 'Experienced'),
('jane.smith@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Jane Smith', '09181234567', '456 Oak Ave, Quezon City', 'Apartment', 'Yes', 'No', 'First-time'),
('mike.wilson@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Mike Wilson', '09191234567', '789 Pine Rd, Makati', 'Condo', 'No', 'No', 'Experienced'),
('anna.farmer@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Anna Farmer', '09201234567', 'Sitio Greenfields, Batangas', 'Farm', 'Yes', 'Yes', 'Experienced'),
('carlos.santos@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Carlos Santos', '09211234567', '321 Beach Rd, Cebu', 'House', 'Yes', 'Yes', 'Experienced'),
('maria.garcia@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Maria Garcia', '09221234567', '654 Hill St, Davao', 'Apartment', 'No', 'No', 'First-time'),
('david.lee@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'David Lee', '09231234567', '987 Lake View, Tagaytay', 'House', 'Yes', 'No', 'Experienced'),
('sofia.cruz@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Sofia Cruz', '09241234567', '147 Garden Lane, Pasig', 'Condo', 'No', 'Yes', 'First-time'),
('kevin.tan@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Kevin Tan', '09251234567', '258 River St, Taguig', 'Apartment', 'No', 'No', 'First-time'),
('lisa.reyes@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Lisa Reyes', '09261234567', '369 Forest Ave, Antipolo', 'House', 'Yes', 'Yes', 'Experienced');

-- Sample Adoptions (more data for reports)
INSERT INTO Adoption (Pet_ID, Adopter_ID, Application_Date, Adoption_Date, Adoption_Fee, Contract_Signed, Status) VALUES
(5, 1, '2025-03-01', NULL, 2500.00, 'No', 'Pending'),
(2, 2, '2025-03-05', NULL, 1500.00, 'No', 'Pending'),
(11, 4, '2025-01-10', '2025-01-15', 3000.00, 'Yes', 'Completed'),
(7, 2, '2025-02-01', '2025-02-10', 2000.00, 'Yes', 'Returned'),
(9, 3, '2025-02-15', NULL, NULL, 'No', 'Cancelled'),
(17, 5, '2025-03-08', NULL, 1800.00, 'No', 'Pending'),
(20, 7, '2025-01-12', '2025-01-20', 3500.00, 'Yes', 'Completed'),
(21, 1, '2025-01-25', '2025-02-01', 1500.00, 'Yes', 'Completed'),
(3, 6, '2025-03-10', NULL, 2800.00, 'No', 'Pending'),
(12, 8, '2025-03-12', NULL, 2200.00, 'No', 'Pending'),
(16, 9, '2025-03-14', NULL, 2000.00, 'No', 'Pending'),
(18, 10, '2025-03-15', NULL, 3200.00, 'No', 'Pending');

-- Sample Veterinary Visits
INSERT INTO Veterinary_Visit (Pet_ID, Visit_Date, Veterinarian_Name, Visit_Type, Weight, Temperature, Diagnosis, General_Notes, Procedure_Cost, Next_Visit_Date) VALUES
(1, '2025-01-20', 'Dr. Santos', 'Checkup', 28.50, 38.50, 'Healthy', 'Routine checkup', 500.00, '2025-04-20'),
(1, '2025-02-15', 'Dr. Santos', 'Vaccination', 29.00, 38.30, 'Healthy', 'Annual vaccination', 1200.00, '2026-02-15'),
(2, '2025-02-25', 'Dr. Reyes', 'Checkup', 4.20, 38.80, 'Healthy', 'Stable condition', 500.00, '2025-05-25'),
(3, '2025-01-15', 'Dr. Santos', 'Checkup', 32.00, 38.60, 'Healthy', 'Active and alert', 500.00, '2025-04-15'),
(7, '2025-03-01', 'Dr. Cruz', 'Treatment', 25.00, 39.20, 'Skin allergy', 'Medication prescribed', 1500.00, '2025-03-15'),
(6, '2025-03-05', 'Dr. Lim', 'Surgery', 4.80, 38.90, 'Dental disease', 'Dental surgery successful', 4500.00, '2025-04-05'),
(10, '2025-03-12', 'Dr. Cruz', 'Emergency', 6.20, 39.80, 'High fever', 'Emergency care provided', 3000.00, NULL);

-- Sample Vaccinations
INSERT INTO Vaccination (Visit_ID, Vaccine_Name, Date_Administered, Administered_By, Manufacturer, Next_Due_Date, Site, Reaction, Status, Cost) VALUES
(2, 'Rabies', '2025-02-15', 'Dr. Santos', 'Zoetis', '2026-02-15', 'Left shoulder', NULL, 'Completed', 600.00),
(2, 'DHPP', '2025-02-15', 'Dr. Santos', 'Nobivac', '2026-02-15', 'Right hip', NULL, 'Completed', 600.00),
(3, 'FVRCP', '2025-02-25', 'Dr. Reyes', 'Purevax', '2026-02-25', 'Left shoulder', NULL, 'Completed', 500.00),
(3, 'Rabies', '2025-02-25', 'Dr. Reyes', 'Zoetis', '2026-02-25', 'Right hip', NULL, 'Completed', 500.00),
(6, 'Rabies', NULL, NULL, NULL, '2025-04-01', NULL, NULL, 'Scheduled', NULL),
(7, 'FVRCP', NULL, NULL, NULL, '2025-02-01', NULL, NULL, 'Overdue', NULL);

-- Sample Favorites (significantly more data for Top 10 Most Favorited query)
INSERT INTO Favorite (Adopter_ID, Pet_ID, Notes) VALUES
-- Buddy (Golden Retriever) - 9 favorites
(1, 1, 'Good with children'),
(2, 1, 'Love Golden Retrievers'),
(3, 1, 'Perfect family dog'),
(4, 1, 'Great temperament'),
(5, 1, 'So friendly!'),
(6, 1, 'Beautiful coat'),
(7, 1, 'Want to adopt!'),
(8, 1, 'Amazing dog'),
(9, 1, 'Best breed ever'),
-- Luna (Persian) - 7 favorites
(1, 2, 'Beautiful white fur'),
(2, 2, 'So fluffy!'),
(3, 2, 'Elegant cat'),
(5, 2, 'Love Persians'),
(7, 2, 'Gorgeous'),
(8, 2, 'Perfect lap cat'),
(10, 2, 'Would love to adopt'),
-- Max (German Shepherd) - 8 favorites
(1, 3, 'Protective nature'),
(2, 3, 'Loyal companion'),
(4, 3, 'Great guard dog'),
(5, 3, 'Intelligent'),
(6, 3, 'Beautiful markings'),
(7, 3, 'Love shepherds'),
(9, 3, 'Perfect for family'),
(10, 3, 'Amazing breed'),
-- Whiskers (Tabby) - 6 favorites
(1, 4, 'Orange cats are the best'),
(2, 4, 'So playful'),
(3, 4, 'Playful personality'),
(5, 4, 'Love the color'),
(6, 4, 'Adorable'),
(8, 4, 'Cute kitten'),
-- Mittens (Siamese) - 7 favorites
(2, 6, 'Very social'),
(3, 6, 'Siamese are beautiful'),
(4, 6, 'Love the personality'),
(5, 6, 'So elegant'),
(6, 6, 'Blue eyes are stunning'),
(8, 6, 'Want this one'),
(10, 6, 'Gorgeous cat'),
-- Shadow (Black Shorthair) - 5 favorites
(2, 8, 'Black cats are lucky'),
(3, 8, NULL),
(4, 8, 'Mysterious beauty'),
(5, 8, 'Love black cats'),
(9, 8, 'So sleek'),
-- Daisy (Beagle) - 8 favorites
(1, 9, 'Energetic and fun'),
(2, 9, 'Love beagles'),
(4, 9, 'Great for kids'),
(5, 9, 'So cute!'),
(6, 9, 'Perfect size'),
(7, 9, 'Adorable face'),
(8, 9, 'Great family dog'),
(10, 9, 'Love the breed'),
-- Oliver (Maine Coon) - 7 favorites
(1, 10, 'Maine Coons are majestic'),
(2, 10, 'So fluffy!'),
(4, 10, 'Gentle giant'),
(7, 10, 'Amazing breed'),
(8, 10, 'Love big cats'),
(9, 10, 'Beautiful cat'),
(10, 10, 'Would adopt immediately'),
-- Coco (Poodle) - 6 favorites
(1, 12, 'Smart dog'),
(3, 12, 'Hypoallergenic'),
(4, 12, 'Elegant'),
(6, 12, 'Love poodles'),
(8, 12, 'Perfect apartment dog'),
(10, 12, 'Beautiful coat'),
-- Simba (Orange Tabby) - 5 favorites
(2, 13, 'Love orange tabbies'),
(4, 13, 'So adventurous'),
(8, 13, 'Cute kitten'),
(9, 13, 'Love the energy'),
(10, 13, 'Playful'),
-- Rosie (Shih Tzu) - 6 favorites
(1, 14, 'Shih Tzus are adorable'),
(3, 14, 'Perfect lap dog'),
(5, 14, 'So cuddly'),
(6, 14, 'So fluffy'),
(7, 14, 'Great companion'),
(9, 14, 'Love small dogs'),
-- Milo (British Shorthair) - 5 favorites
(2, 15, 'Chonky cat'),
(4, 15, 'Love the round face'),
(6, 15, 'So relaxed'),
(8, 15, 'Perfect indoor cat'),
(10, 15, 'Adorable'),
-- Duke (Rottweiler) - 4 favorites
(1, 16, 'Strong and loyal'),
(3, 16, 'Great protector'),
(5, 16, 'Beautiful dog'),
(7, 16, 'Amazing breed'),
-- Bear (Husky) - 7 favorites
(1, 18, 'Beautiful eyes'),
(2, 18, 'Love huskies'),
(3, 18, 'So energetic'),
(5, 18, 'Gorgeous coat'),
(6, 18, 'Wolf-like'),
(8, 18, 'Amazing dog'),
(10, 18, 'Would love to run with'),
-- Cleo (Abyssinian) - 4 favorites
(2, 19, 'Active cat'),
(4, 19, 'Love the color'),
(7, 19, 'Curious nature'),
(9, 19, 'Beautiful'),
-- Rex (Doberman) - 5 favorites
(1, 22, 'Dobermans are loyal'),
(5, 22, 'Great guard dog'),
(7, 22, 'Beautiful dog'),
(8, 22, 'Elegant'),
(10, 22, 'Strong and sleek'),
-- Pepper (Tuxedo) - 4 favorites
(1, 23, 'Cute markings'),
(3, 23, 'Tuxedo cats are special'),
(6, 23, 'Playful'),
(9, 23, 'Adorable'),
-- Cooper (Cocker Spaniel) - 6 favorites
(2, 24, 'Sweet face'),
(3, 24, 'Cocker Spaniels are sweet'),
(5, 24, 'Love the ears'),
(6, 24, 'Beautiful golden coat'),
(8, 24, 'Great family dog'),
(10, 24, 'Perfect family pet'),
-- Lily (Calico) - 4 favorites
(1, 25, 'Unique markings'),
(4, 25, 'Beautiful colors'),
(7, 25, 'Love calicos'),
(9, 25, 'Independent spirit');

-- Sample Admin (password is 'admin123' hashed with bcrypt)
INSERT INTO Admin (Email, Password_Hash, Full_Name) VALUES
('admin@petadopt.com', '$2b$10$ykNAFRVUuJvT3X8pwFdD4uVAqNOTzFcJ2x9wUs06RCslNWT028QnG', 'System Admin');

-- =============================================
-- TRIGGERS (Auto-sync statuses between tables)
-- =============================================

-- TRIGGER 1: Validate pet availability before creating adoption
DELIMITER //
CREATE TRIGGER trg_adoption_before_insert_validate
BEFORE INSERT ON Adoption
FOR EACH ROW
BEGIN
    DECLARE pet_status VARCHAR(20);

    SELECT Status INTO pet_status FROM Pet WHERE Pet_ID = NEW.Pet_ID;

    IF pet_status != 'Available' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Pet is not available for adoption';
    END IF;
END //
DELIMITER ;

-- TRIGGER 2: Auto-set pet to 'Reserved' when new adoption is created
DELIMITER //
CREATE TRIGGER trg_adoption_after_insert
AFTER INSERT ON Adoption
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Pending' THEN
        UPDATE Pet SET Status = 'Reserved' WHERE Pet_ID = NEW.Pet_ID;
    ELSEIF NEW.Status = 'Completed' THEN
        UPDATE Pet SET Status = 'Adopted' WHERE Pet_ID = NEW.Pet_ID;
    END IF;
END //
DELIMITER ;

-- TRIGGER 3: Auto-set adoption date and contract when status becomes 'Completed'
DELIMITER //
CREATE TRIGGER trg_adoption_before_update
BEFORE UPDATE ON Adoption
FOR EACH ROW
BEGIN
    -- Auto-set adoption date when status changes to Completed
    IF NEW.Status = 'Completed' AND OLD.Status != 'Completed' THEN
        IF NEW.Adoption_Date IS NULL THEN
            SET NEW.Adoption_Date = CURDATE();
        END IF;
        SET NEW.Contract_Signed = 'Yes';
    END IF;
END //
DELIMITER ;

-- TRIGGER 4: Sync pet status when adoption status changes
DELIMITER //
CREATE TRIGGER trg_adoption_after_update
AFTER UPDATE ON Adoption
FOR EACH ROW
BEGIN
    -- Only act if status actually changed
    IF OLD.Status != NEW.Status THEN
        CASE NEW.Status
            WHEN 'Pending' THEN
                UPDATE Pet SET Status = 'Reserved' WHERE Pet_ID = NEW.Pet_ID;
            WHEN 'Completed' THEN
                UPDATE Pet SET Status = 'Adopted' WHERE Pet_ID = NEW.Pet_ID;
            WHEN 'Cancelled' THEN
                UPDATE Pet SET Status = 'Available' WHERE Pet_ID = NEW.Pet_ID;
            WHEN 'Returned' THEN
                UPDATE Pet SET Status = 'Available' WHERE Pet_ID = NEW.Pet_ID;
        END CASE;
    END IF;
END //
DELIMITER ;

-- TRIGGER 5: Set pet back to 'Available' when adoption is deleted
DELIMITER //
CREATE TRIGGER trg_adoption_after_delete
AFTER DELETE ON Adoption
FOR EACH ROW
BEGIN
    -- Only set to Available if no other completed adoption exists for this pet
    IF NOT EXISTS (
        SELECT 1 FROM Adoption
        WHERE Pet_ID = OLD.Pet_ID AND Status = 'Completed'
    ) THEN
        UPDATE Pet SET Status = 'Available' WHERE Pet_ID = OLD.Pet_ID;
    END IF;
END //
DELIMITER ;

-- TRIGGER 6: Remove favorites when pet is adopted
DELIMITER //
CREATE TRIGGER trg_pet_after_update_cleanup_favorites
AFTER UPDATE ON Pet
FOR EACH ROW
BEGIN
    -- Remove from favorites when pet is adopted
    IF NEW.Status = 'Adopted' AND OLD.Status != 'Adopted' THEN
        DELETE FROM Favorite WHERE Pet_ID = NEW.Pet_ID;
    END IF;
END //
DELIMITER ;

-- =============================================
-- SCHEDULED EVENT (Auto-update overdue vaccinations)
-- =============================================

-- Enable event scheduler (run this once on your MySQL server)
-- SET GLOBAL event_scheduler = ON;

-- Event to auto-update vaccination status to 'Overdue' daily
DELIMITER //
CREATE EVENT IF NOT EXISTS evt_update_overdue_vaccinations
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 1 HOUR)
DO
BEGIN
    UPDATE Vaccination
    SET Status = 'Overdue'
    WHERE Status = 'Scheduled'
      AND Next_Due_Date < CURDATE();
END //
DELIMITER ;

-- =============================================
-- INDEXES (Performance optimization)
-- =============================================
CREATE INDEX idx_pet_status ON Pet(Status);
CREATE INDEX idx_pet_species ON Pet(Species);
CREATE INDEX idx_pet_date_arrived ON Pet(Date_Arrived);
CREATE INDEX idx_adoption_status ON Adoption(Status);
CREATE INDEX idx_adoption_pet ON Adoption(Pet_ID);
CREATE INDEX idx_adoption_adopter ON Adoption(Adopter_ID);
CREATE INDEX idx_adoption_date ON Adoption(Adoption_Date);
CREATE INDEX idx_adoption_application_date ON Adoption(Application_Date);
CREATE INDEX idx_vaccination_status ON Vaccination(Status);
CREATE INDEX idx_vaccination_next_due ON Vaccination(Next_Due_Date);
CREATE INDEX idx_favorite_adopter ON Favorite(Adopter_ID);
CREATE INDEX idx_favorite_pet ON Favorite(Pet_ID);
CREATE INDEX idx_vet_visit_pet ON Veterinary_Visit(Pet_ID);

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- STORED PROCEDURE 1: Search Available Pets by Species
-- Allows users to filter available pets by species for easier browsing
DELIMITER //
CREATE PROCEDURE sp_get_available_pets_by_species(
    IN p_species VARCHAR(50)
)
BEGIN
    SELECT Pet_ID, Pet_Name, Breed, Age, Gender, Photo_URL
    FROM Pet
    WHERE Status = 'Available'
    AND Species = p_species
    ORDER BY Date_Arrived DESC;
END //
DELIMITER ;

-- STORED PROCEDURE 2: Monthly Adoption Statistics Report
-- Generates adoption statistics for any given month for business reporting
DELIMITER //
CREATE PROCEDURE sp_monthly_adoption_stats(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT
        COUNT(*) as total_adoptions,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN Status = 'Returned' THEN 1 ELSE 0 END) as returned,
        COALESCE(SUM(Adoption_Fee), 0) as total_revenue,
        COALESCE(AVG(Adoption_Fee), 0) as avg_fee
    FROM Adoption
    WHERE YEAR(Adoption_Date) = p_year
    AND MONTH(Adoption_Date) = p_month;
END //
DELIMITER ;
```

## Triggers Summary

| Trigger Name | Event | Purpose |
|--------------|-------|---------|
| `trg_adoption_before_insert_validate` | BEFORE INSERT on Adoption | Prevents adoption if pet is not available |
| `trg_adoption_after_insert` | AFTER INSERT on Adoption | Sets pet to 'Reserved' or 'Adopted' |
| `trg_adoption_before_update` | BEFORE UPDATE on Adoption | Auto-fills Adoption_Date and Contract_Signed |
| `trg_adoption_after_update` | AFTER UPDATE on Adoption | Syncs Pet.Status with Adoption.Status |
| `trg_adoption_after_delete` | AFTER DELETE on Adoption | Sets pet back to 'Available' |
| `trg_pet_after_update_cleanup_favorites` | AFTER UPDATE on Pet | Removes favorites when pet is adopted |
| `evt_update_overdue_vaccinations` | Daily scheduled event | Marks vaccinations as 'Overdue' |

## Quick Setup Commands

```bash
# Login to MySQL
mysql -u root -p

# Run the initialization script
source /path/to/init.sql

# Or copy-paste the SQL above directly into MySQL client
```

## Connection Configuration

For the application to connect, use these default settings:

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 3306 |
| Database | pet_adoption_center |
| User | root (or your MySQL user) |
| Password | your_mysql_password |

## Verify Installation

```sql
USE pet_adoption_center;
SHOW TABLES;

-- Expected output:
-- +------------------------------+
-- | Tables_in_pet_adoption_center|
-- +------------------------------+
-- | Admin                        |
-- | Adopter                      |
-- | Adoption                     |
-- | Favorite                     |
-- | Pet                          |
-- | Vaccination                  |
-- | Veterinary_Visit             |
-- +------------------------------+
```
