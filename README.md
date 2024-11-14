# App Name
MoviesTracker

# Project Group-6
 Yichen Wang && Wangfan Qian

# Project Overview
MoviesTracker transforms how you experience and share cinematic adventures. More than a movie database, it’s your personalized film companion, offering a rich, immersive way to track and remember each film.

# App Functionality
* **CRUD Operations:** Users can create, read and delete data about their reviews, favorites, and personal info

* **Movies Recommendation:** Discover popular movies and shows across various categories and genres based on the current trends.  

* **Movies Search:** Search through a vast collection of movies and TV shows to find exactly what you’re looking for.  

* **Favorites & Sorting:** Save your favorite movies for easy access and organize your collection with sorting options.   

* **Footprint Map(TBD):** Track your cinematic journey visually by tagging where you watched each movie. See your global movie footprint displayed on an interactive map.  

* **Notifications(TBD):** Set reminders for upcoming releases or movies on your watchlist to ensure you never miss a movie.  

* **Location Tagging(TBD):** Tag your viewing location for each film, whether it’s your hometown theater or an exotic location abroad, adding geographical context to your movie experiences.  

# Data Model and Firebase Collections  

## Firestore Collections  

### 1. Reviews  

Stores user reviews for movies.  

**Fields:**  

* `movieId` (string): Identifier of the movie being reviewed.  
* `text` (string): Content of the review.  
* `timestamp` (timestamp): Time when the review was created or last updated.  
* `userId` (string): Identifier of the user who wrote the review.  
* `userName` (string): Name of the user who wrote the review.  

**CRUD Operations:**  

* **Create:** When a user submits a new review.  
* **Read:** Fetching all reviews for a specific movie.  
* **Update:** When a user edits their existing review.  
* **Delete:** When a user deletes their review.  

### 2. Bookmarks  

Stores information about movies bookmarked by users.  

**Fields:**  

* `director` (string): Director of the movie.  
* `genres` (array of strings): Array of genres of the movie.  *(Improved from comma-separated string)*  
* `movieId` (string): Identifier of the bookmarked movie. 
* `movieTitle` (string): Title of the bookmarked movie.  
* `posterPath` (string): Path to the movie’s poster image (pointing to Firebase Storage).  
* `bookmarkId` (string): Unique identifier for the bookmark (auto-generated).  
* `userId` (string): Identifier of the user who bookmarked the movie.  
* `releaseDate` (timestamp): Release date of the movie.  
* `timestamp` (timestamp): Time when the movie was bookmarked.  

**CRUD Operations:**  

* **Create:** When a user bookmarks a movie.  
* **Read:** Fetching all bookmarks for a user.  
* **Update:** (Optional) Update bookmark details if necessary.  
* **Delete:** When a user removes a bookmark.  

### 3. Users
Stores user profile information 

**Fields:**  
* `userId` (string): Identifier of the user who bookmarked the movie.  
* `birthdate`(timestamp): when birthdate
* `gender`(string): what gender

**CRUD Operations:**  

* **Create:** Create birthdate and choose gender
* **Read:** Fetching all personal info for a user.  
* **Update:** Update the personal info
* **Delete:**  (Optional) 


### 4. (Optional) Settings(Not Implemented yet) 

Stores user-specific settings/preferences.  

**Fields:**  

* `userId` (string): Identifier of the user.  
* `darkMode` (boolean): Indicates if dark mode is enabled.  
* `notifications` (boolean): Indicates if push notifications are enabled.  
* `otherPreferences` (map): Additional user preferences.  

**CRUD Operations:**  

* **Create:** When a user first sets up their settings.  
* **Read:** Fetching user settings.  
* **Update:**: When a user changes their settings.  
* **Delete:** When a user deletes their account or resets settings.  



## Firebase Storage Structure  

Firebase Storage would primarily be used to store:  

### 1. Profile Pictures 
* __Structure__:  `profile_images/${user.uid}`
* __Description__: store the profile Pictures
* __Usage__: When users upload or change their profile picture, the image is stored in this folder under a subfolder named after their userId.

# Contributions

## Contribution Division
* **Yichen Wang**:  
	1.	Set up the initial project structure.
	2.	Established the pre-discussed framework.
	3.	Implemented the home screen, including movie and TV show stacks.
	4.	Fixed the bookmark list functionality on Android.

* **Wangfan Qian**:
	1.	Implemented the bookmark screen and resolved display issues.
	2.	Added a comment area and a floating button.
	3.	Fixed screen switching problems and addressed other minor issues.
	4.	Completed the movie sorting function and optimized content and formatting.

# Screenshots
* **Photo1: Home Page**
    1.  Features four navigation stacks at the bottom.
    2. Includes two main tabs: Movies and TV Shows.
![Image Description](https://i.imgur.com/dXfv79E.png) 

* **Photo2: Search Functionality**
	1. Access the search box on the home screen to find desired movies.
![Image Description](https://i.imgur.com/n2RcWIH.png) 

* **Photo3:  Movie Details Page**
	1. Click on a movie to view its details.
	2. Favorite the movie by clicking the flag icon.
	3. Add, edit, or delete comments using the floating action button.
![Image Description](https://i.imgur.com/CQEKUfh.png) 


* **Photo4: Review Management (CRUD Operations)**
	1. perform Create, Read, Update, and Delete (CRUD) operations on reviews.
![Image Description](https://i.imgur.com/7obfy1M.png) 

* **Photo5: Saved Movies Tab**
	1.	In the second tab, view saved movies.
	2. 	Sort movies by release year and date added.
![Image Description](https://i.imgur.com/okrLNLd.png) 

* **Photo6: Account Tab**
    1. Option to log out.
    2. Edit personal information by clicking Edit Profile.
![Image Description](https://i.imgur.com/9PwVgIX.png) 

* **Photo7: Edit Profile Screen**
	*	Edit your name, birthdate, and gender.
	*	Upload or change your profile picture.
![Image Description](https://i.imgur.com/BLDu4FB.png) 









```
