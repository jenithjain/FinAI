from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)  # Corrected __name__
CORS(app)  # Enable CORS to allow requests from React frontend
app.secret_key = 'your_secret_key'

# Configure Gemini API
genai.configure(api_key='your_api_key')

# Generation settings for Gemini
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

# Predefined financial advisement prompts
financial_prompts = {
    1: "How should I plan my budget for the next 6 months?",
    2: "What is the best way to diversify my investment portfolio?",
    # Add more prompts as necessary
}

@app.route('/chat', methods=['POST'])
def chat_gemini():
    try:
        # Get user input from JSON request
        user_input = request.json.get("user_input", "").strip()

        if user_input:
            model = genai.GenerativeModel(
                model_name="gemini-1.0-pro",
                generation_config=generation_config
            )

            # Check if the user input matches a predefined prompt
            response_text = ""
            for key, prompt in financial_prompts.items():
                if user_input.lower() in prompt.lower():
                    response_text = f"For your query: '{prompt}', here's the financial advice..."
                    # Insert logic to generate a detailed financial analysis based on the prompt
                    break

            if response_text:
                return jsonify({"response": response_text})
            else:
                return jsonify({"response": "Your input doesn't match any predefined prompts."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
