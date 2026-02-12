# ⚡ Utility Bill Explainer

A smart web application that helps users understand their electricity and gas bills, analyzes consumption patterns, and provides actionable tips to save money. Powered by **Google Gemini AI**.

![App Screenshot](public/screenshot.png) *(Add a screenshot here)*

## 🚀 Features

-   **🤖 AI-Powered Bill Scanner**:
    -   Upload electricity or gas bills (Image or PDF).
    -   Uses **Google Gemini Vision** to intelligently extract data (Units, Total Amount, Due Date, Reference No, etc.).
    -   Validates bill authenticity.
-   **📊 Smart Analysis**:
    -   Explains complex bill jargon in simple language.
    -   Visualizes cost breakdown (Base price vs Taxes).
    -   Identifies if consumption is high/low based on typical usage.
-   **💡 Savings Simulator**:
    -   Interactive slider to see how reducing usage impacts your bill.
    -   Provides specific, AI-generated tips to reduce costs.
-   **⚡ Multi-Utility Support**:
    -   Works for **Electricity** (HESCO, K-Electric, LESCO, etc.) and **Gas** bills.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS
-   **AI Integration**: Google Generative AI SDK (Gemini Vision `gemini-1.5-flash`, `gemini-2.0-flash`)
-   **File Handling**: `pdfjs-dist` (PDF parsing), `react-dropzone` logic
-   **Visualization**: Recharts
-   **Animations**: Framer Motion, Lucide React icons

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/utility-bill-explainer.git
    cd utility-bill-explainer
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # Important: Ensure pdfjs-dist is installed for PDF support
    npm install pdfjs-dist
    ```

3.  **Setup Environment Variables** (Optional):
    -   Create a `.env` file in the root directory.
    -   Add your Gemini API Key:
        ```env
        VITE_GEMINI_API_KEY=your_api_key_here
        ```
    -   *Note: The app includes a functional **Demo Mode** if no API key is provided.*

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 🖥️ Usage

1.  **Upload a Bill**: Drag & drop an image or PDF of your utility bill.
2.  **Verify Data**: The AI will extract details. Review and edit if necessary in the preview window.
3.  **Analyze**: Click "Explain My Bill" to get an AI breakdown of charges and personalized saving tips.
4.  **Simulate**: Use the Savings Simulator to see how much you could save by reducing consumption.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
