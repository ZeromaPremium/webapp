
# ✨ Zeroma Free - Educational Video Library ✨

Zeroma Free is a modern, responsive web application designed to provide a curated library of free, high-quality educational videos. It offers a seamless and engaging learning experience with a beautiful interface and powerful features.

<br>

*(Note: This is a placeholder image. You can replace it with a screenshot or GIF of your running application\!)*

-----

## 🚀 Core Features

  * **Curated Video Library:** Access educational videos from platforms like ACS and others, completely free of charge.
  * **Dynamic Subject Filtering:** Easily find content for Physics, Math, Chemistry, ICT, Bangla, Biology, and English using a sleek, animated filter bar.
  * **Stunning UI/UX:** A beautiful and intuitive interface designed for a modern learning experience, featuring a unique animated bottom navigation bar.
  * **☀️ Light & 🌙 Dark Mode:** A theme toggle allows users to switch between a light and dark interface for comfortable viewing in any environment.
  * **Fully Responsive Design:** Optimized for all screen sizes, from mobile phones to desktops, ensuring a great experience on any device.
  * **▶️ In-App Video Player:** Watch videos directly on the site in a clean modal player without being redirected to external websites.
  * **Performance Optimized:** Utilizes lazy loading for video thumbnails to ensure fast page loads and a smooth user experience.
  * **Engaging Animations:** Features a typing animation on the homepage and a custom loading screen to engage users from the start.
  * **SEO Ready:** Includes JSON-LD structured data to improve the site's visibility on search engines.

-----

## 🛠️ Tech Stack

  * **Frontend:** HTML5, CSS3, Vanilla JavaScript
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS framework.
  * **Icons:** [Font Awesome](https://fontawesome.com/) & [Ionicons](https://ionicons.com/) for a wide range of high-quality icons.

-----

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need a modern web browser. To correctly fetch the video data from the local `.json` files, you must run the project from a local web server. Opening the `w.html` file directly from your filesystem will likely result in a CORS error.

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/zeroma-free.git
    ```

2.  **Navigate to the project directory:**

    ```sh
    cd zeroma-free
    ```

3.  **Run a local server:**
    The easiest way is to use Python's built-in HTTP server.

    *If you have Python 3 installed:*

    ```sh
    python -m http.server
    ```

    *If you are using VS Code, you can use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.*

4.  **Open the application:**
    Open your browser and navigate to `http://localhost:8000` (or the port specified by your local server).

-----

## 📂 File Structure

The project is structured to be simple and easy to navigate.

```
.
├── 📄 w.html              # The main and only HTML file for the single-page application.
├── 📄 script.js           # Contains all JavaScript for interactivity, filtering, and UI logic.
├── 📄 videos.json         # Master list of all videos (can be used for the 'All' filter).
├── 📄 bangla.json         # JSON data files for each specific subject.
├── 📄 chemistry.json
├── 📄 ... (etc.)
└── 📄 README.md           # You are here!
```

-----

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  **Fork** the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  **Push** to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a **Pull Request**

-----

## 📄 License

Distributed under the MIT License. See the `LICENSE` file for more information.

-----

## 📧 Contact

Your Name - [@your\_twitter](https://www.google.com/search?q=https://twitter.com/your_twitter) - your.email@example.com

Project Link: [https://github.com/your-username/zeroma-free](https://www.google.com/search?q=https://github.com/your-username/zeroma-free)
