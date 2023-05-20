# Athena for Search
![Athena For Search](athena-search-web.png)

![Athena for Search with Citations](athena-search-web.png)
Athena for Search is a dynamic search application, inspired by the purpose of APAC AI to redefine Human-Computer Interaction. Our mission is to automate repetitive tasks, enabling humans to channel their creativity and innovative spirit into more meaningful activities.

If you have any inquiries, do not hesitate to connect with us on Twitter.

## How It Works
Athena for Search, given a user query, retrieves the most relevant and recent information from the internet and leverages OpenAI's API to formulate a response.

The operation of the application is as follows:

1. Receive query from the user
2. Scrape Google for relevant web pages
3. Parse the web pages to extract text
4. Construct a prompt using the query and webpage text
5. Use OpenAI API to generate an answer
6. Stream the response back to the user

## Requirements
To use Athena for Search, you will need an OpenAI API key. You can obtain one [here](https://beta.openai.com/signup/).

## Running Locally
To run Athena for Search locally, follow these steps:

1. Clone the repository
    ```
    git clone https://github.com/APACAI/athena-for-search.git
    ```
2. Install the dependencies
    ```
    npm i
    ```
3. Run the application
    ```
    npm run dev
    ```

# Extensive Roadmap

## Short-Term Advancements

1. **Embedded Internet Queries:** Implement the initial phase of embedding internet data into multi-modality SOTA (State of the Art) vectors to enable advanced data querying capabilities.

2. **Intelligent Follow-Up Queries:** Build a system that intelligently constructs follow-up queries based on initial search results to provide more detailed, context-rich information to the user.

3. **Personalized User Experience:** Introduce user profiles, which will adapt search results and the overall application interface according to individual user behavior and preferences.

4. **Secure User Data:** Establish a robust data privacy protocol to ensure user data is secure and private.

5. **Interactive UI:** Design a more intuitive and user-friendly UI/UX with easy-to-use navigation features and a sleek, modern aesthetic.

## Mid-Term Advancements

1. **Complete Web Integration:** The full-scale integration of the complete internet into multi-modality SOTA vectors will be implemented, thereby revolutionizing the way we query and interact with online data.

2. **Multimodal Search Capabilities:** Users will be able to query data using various forms, including text, voice, images, and even videos, further enhancing the search experience.

3. **AI-Powered Suggestions:** Introduce AI-powered suggestions to help users find what they might not know they are looking for, by predicting their needs based on past behaviors, preferences, and trends.

4. **Real-Time Updates:** Develop a real-time data indexing system to ensure search results always reflect the most recent and relevant data.

5. **Advanced Language Models:** Utilize more sophisticated language models to understand complex queries and provide highly precise and contextually accurate responses.

## Long-Term Advancements

1. **Internet Archive Integration:** Achieve integration with the Internet Archive to provide a historical perspective of web data and allow users to view older versions of web pages.

2. **Multilingual Support:** Provide multilingual support, allowing users worldwide to use Athena in their native languages.

3. **3D Web Visualization:** Create a 3D visualization tool to better represent the relationships between different parts of the internet, which will help users navigate their search results more intuitively.

4. **Semantic Search Capabilities:** Develop advanced semantic search capabilities for Athena to comprehend the intent and contextual meaning of search queries, offering more relevant results.

5. **AI-Assisted Content Creation:** Introduce an AI-assisted content creation tool that helps users generate articles, reports, presentations, and more using Athena's data and insights.

The future of search is here. Athena for Search aims to make every piece of information on the internet easily accessible, allowing you to explore and discover with unprecedented ease and precision. Join us on this journey to redefine the way we interact with the digital world.
