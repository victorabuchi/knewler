// The real Web Programming I exam of 23.10.2026, in the Moodle order (from the student's screenshots), with answers.
// `realNo` is the question number in the exam. options[0] is the correct answer; `display` is the order the options had in Moodle (a, b, c, d).
// The open questions (kind "explain") have a model answer and key points to grade yourself with. Each question is also tagged with the week
// and topic it belongs to, so it is part of Practice too.
const base = { subject: 'webprog', kind: 'mcq' }
const open = { subject: 'webprog', kind: 'explain' }
// mcq(no, week, topic, question, correct, [the options in Moodle order], why)
const mcq = (realNo, week, topic, q, correct, display, why) => ({ ...base, id: `ex23-${realNo}`, realNo, week, topic, q, options: [correct, ...display.filter((o) => o !== correct)], display, why })

export const topics = {}
export const learn = []

export const questions = [
  mcq(1, 5, 'react', 'Which of the following best describes props in React?',
    'Props are immutable and passed in from outside the component',
    ['Props are immutable and passed in from outside the component', 'Props are read-only inside the parent component, but child can modify them by component state', 'A component can freely modify its own props', 'Props are default values that React assigns to components when no explicit data is provided by the parent'],
    'Props come from the parent and are read-only in the component that receives them. To change something over time, a component uses state; to change a prop, the parent passes a new value.'),
  mcq(2, 5, 'react', 'Why can component-based architecture improve maintainability?',
    'It localizes behavior and UI concerns into smaller units with clearer boundaries',
    ['It prevents the browser from caching components', 'It makes component state management unnecessary by default', 'It ensures that the browser only loads the components that are currently visible on screen, reducing initial load time', 'It localizes behavior and UI concerns into smaller units with clearer boundaries'],
    'Each component owns one piece of the UI and its logic, so a change or bug stays inside one small, reusable unit. It does not remove the need for state or change how the browser loads code.'),
  mcq(3, 4, 'jsapi', 'Why might two requests to the same endpoint return different responses?',
    'The server determines its response based on factors such as the current data, the requester\'s identity, or information in the request headers',
    ['The server determines its response based on factors such as the current data, the requester\'s identity, or information in the request headers', 'HTTP assigns a uniqueness token to each response to prevent duplicate content from being cached on the client side', 'The browser builds a new DOM for each request, causing the response to appear different even when the content is the same', 'The server automatically rotates between cached versions of the response to distribute load evenly across all connected clients'],
    'The URL is only part of the request. The server also looks at its data (which may have changed), who is asking (cookies, tokens) and the headers, and builds the response from all of that.'),
  mcq(4, 4, 'jsapi', 'A React app fetches new posts every time the user clicks a button. Each request includes the API key in the headers. Which property of HTTP best explains why the key must be sent with every request?',
    'HTTP is stateless, the server retains no memory of previous requests',
    ['HTTP responses are cached by default so the key is stored server-side', 'HTTP is stateless, the server retains no memory of previous requests', 'API keys only apply to the first request in a session', 'The browser removes headers automatically after the first successful response'],
    'HTTP is stateless: every request stands on its own, so anything the server needs (like the API key) must be sent again every time.'),
  { ...open, id: 'ex23-5', realNo: 5, week: 5, topic: 'react',
    q: 'Below is the component tree of a weather dashboard app. The app has four screens that users can navigate between: a current weather view, a forecast view, a rain map view, and a settings view. The Settings screen contains LanguageSelector for choosing language and UnitSelector for choosing Celsius or Fahrenheit as temperature unit. The CurrentWeather component displays the current weather including temperature, using TemperatureDisplay and WeatherIcon (icon for the weather type). The Forecast component displays temperatures for the next 7 days. The RainMap component displays rain areas on the map. Answer the questions: a) Where should the state that holds the selected temperature unit be stored? Choose the most suitable component from the tree. Justify your choice. b) Describe what happens in the component tree when the user changes the unit in UnitSelector. Trace the full path from user interaction to updated UI.',
    code: `App
├── Header
│   └── Navigation
├── MainView
│   ├── CurrentWeather
│   │   ├── TemperatureDisplay
│   │   └── WeatherIcon
│   ├── Forecast
│   ├── RainMap
│   │   └── LocationMarker
│   └── Settings
│       ├── UnitSelector
│       └── LanguageSelector
└── Footer`,
    keyPoints: [
      'a) In MainView: it is the closest common parent (lowest common ancestor) of UnitSelector (inside Settings), which changes the unit, and TemperatureDisplay (inside CurrentWeather) and Forecast, which show temperatures ("lifting state up")',
      'a) Not in UnitSelector or Settings (siblings like CurrentWeather and Forecast could not read it) and not needed higher in App (Header and Footer do not use the unit)',
      'b) MainView passes the unit and a setter function (for example setUnit) down as props: through Settings to UnitSelector, and the unit to CurrentWeather/TemperatureDisplay and Forecast',
      'b) The user picks a unit in UnitSelector; its onChange event handler calls the setter received through props, which updates the state in MainView',
      'b) The state change makes React re-render MainView and its children; the new unit flows down as props, so TemperatureDisplay and Forecast show the temperatures in the new unit (data down through props, events up through callbacks)',
    ],
    model: 'a) The unit state belongs in MainView. Several components need it: UnitSelector (in Settings) changes it, and TemperatureDisplay (in CurrentWeather) and Forecast display temperatures with it. State should live in the closest common parent of all components that use it, and that is MainView. Keeping it in UnitSelector or Settings would hide it from CurrentWeather and Forecast (siblings cannot share state directly); putting it in App would also work but is higher than needed, because Header and Footer do not use the unit. b) MainView holds const [unit, setUnit] = useState("celsius") and passes setUnit down through Settings to UnitSelector, and unit down to CurrentWeather (then TemperatureDisplay) and Forecast. When the user chooses Fahrenheit, the onChange handler of UnitSelector calls setUnit("fahrenheit") (a callback received as a prop). The state in MainView changes, React re-renders MainView and its children, and the new unit is passed down as props: TemperatureDisplay and Forecast render the temperatures in Fahrenheit. Data flows down through props, events flow up through callback functions.' },
  mcq(6, 5, 'react', 'React uses a Virtual DOM. Which statement best explains why this is relevant to performance?',
    'React compares the previous and current Virtual DOM and updates only the parts of the real DOM that changed',
    ['React compares the previous and current Virtual DOM and updates only the parts of the real DOM that changed', 'The Virtual DOM stores a complete copy of the real DOM and calculates if the state needs to be changed', 'The Virtual DOM stores all state so the real DOM never needs to be updated', 'The Virtual DOM stores a complete copy of the real DOM and replaces it entirely on every state change to ensure consistency'],
    'Changing the real DOM is slow. React renders to a lightweight Virtual DOM, compares (diffs) it with the previous one, and changes only what is different in the real DOM.'),
  mcq(7, 4, 'jsapi', 'A developer opens a React app in a browser. The app loads and immediately fetches a list of posts from an external API. Which statement best describes the roles in this interaction?',
    'The browser running the app is the client, the API server processes requests',
    ['The API server renders the React components and sends them to the browser', 'The browser running the app is the client, the API server processes requests', 'Both the React app and the API are clients', 'The React app is the server processing data, the external API is the client'],
    'The React app runs in the browser and sends the requests, so it is the client. The API server receives the requests and sends back data (usually JSON); it does not render React components.'),
  mcq(8, 4, 'jsapi', 'A developer wants to remove a post from a REST API. Which combination of HTTP method and expected outcome is correct?',
    'DELETE to the post URL, the server removes the resource',
    ['DELETE to the post URL, the server removes the resource', 'POST to the post URL with an empty body, the server interprets this as deletion', 'PUT to the post URL with an empty body, the server replaces it with nothing', 'GET the post URL, the server removes it automatically'],
    'In REST the method says what to do with the resource the URL names: GET reads, POST creates, PUT/PATCH update, DELETE removes.'),
  mcq(9, 5, 'react', 'Which of the following best describes what a SPA is?',
    'A web application that loads a single HTML document and dynamically updates content in the browser without full page reloads',
    ['A web application that loads a single HTML document and dynamically updates content in the browser without full page reloads', 'A web application that loads a single HTML document and fetches new content from the server each time the user navigates to a different view', 'A web application that loads a single HTML document and dynamically updates the URL through server-side routing without reloading the page', 'A web application that loads a single HTML document and updates the URL by fetching a new document from the server on each navigation'],
    'A single-page application loads one HTML page and then JavaScript updates the content (and the URL, with client-side routing) in the browser, without loading new documents from the server.'),
  { ...open, id: 'ex23-10', realNo: 10, week: 5, topic: 'react',
    q: 'Below is a React component that displays a list of recent earthquakes fetched from API. The component fetches the earthquake data when it first appears on the page. Study the code and answer the questions below. a) Explain the parameters passed to the useEffect hook in this code. What is the purpose of each parameter? b) What is the initial value of the earthquakes state? Why is the defined initial value of the earthquakes state used rather than, for example, null or undefined?',
    code: `import { useState, useEffect } from 'react';

function EarthquakeMonitor() {
    const [earthquakes, setEarthquakes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getEarthquakes = async () => {
            const response = await fetch(
                'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=20'
            );
            const data = await response.json();
            setEarthquakes(data.features);
            setLoading(false);
        };
        getEarthquakes();
    }, []);

    if (loading) {
        return <p>Loading recent earthquakes...</p>;
    }

    return (
        <div>
            <h2>Recent earthquakes worldwide</h2>
            <ul>
                {earthquakes.map(quake => (
                    <li key={quake.id}>
                        <strong>Magnitude {quake.properties.mag}</strong>
                        {' at '}
                        {quake.properties.place}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EarthquakeMonitor;`,
    keyPoints: [
      'a) The first parameter is the effect function: React runs it after the component has rendered; here it defines and calls the async function getEarthquakes, which fetches the data, stores it with setEarthquakes and sets loading to false',
      'a) The second parameter is the dependency array []; an empty array means the effect runs only once, after the first render (when the component appears), not after every re-render',
      'a) Without the array the effect would run after every render, and because it updates state (which causes a render) it would fetch again and again (an endless loop of requests)',
      'b) The initial value is an empty array []',
      'b) The component calls earthquakes.map(...); an array always has map, so the code works before the data has arrived (an empty list), while null or undefined would crash with a TypeError ("Cannot read properties of null (reading \'map\')")',
      'b) It also keeps the type of the state the same (always an array, a list of earthquakes), which makes the code simpler and safer',
    ],
    model: 'a) useEffect gets two parameters. The first is the effect function. React calls it after the component has rendered, so side effects like fetching data do not block rendering. Here it defines the async function getEarthquakes, which fetches the 20 latest earthquakes, converts the response to JSON, stores data.features in the earthquakes state and sets loading to false; then it calls getEarthquakes(). (The effect function itself is not async; it calls an async function inside.) The second parameter is the dependency array. It tells React when to run the effect again: an empty array [] means "only once, after the first render", which is exactly "fetch when the component first appears". Without it, the effect would run after every render, and since it sets state (causing a new render), it would fetch over and over. b) The initial value is an empty array, useState([]). The render code calls earthquakes.map(...), and map only exists on arrays. With an empty array the list simply renders nothing until the data arrives, and the state always has the same type (a list of earthquakes). With null or undefined, earthquakes.map would throw a TypeError ("Cannot read properties of null") as soon as that code runs, for example if loading were false before the data was set.' },
  mcq(11, 4, 'jsapi', 'A browser sends a request to /api/profile but the response depends on whether the user is authenticated. What does this best illustrate?',
    'The server may use request context such as cookies or headers before deciding what to return',
    ['The server reads the request and forwards it to the browser\'s DOM, which then decides what content to return based on the user\'s session', 'The DOM intercepts the request and injects authentication data before it reaches the server', 'The server may use request context such as cookies or headers before deciding what to return', 'The server reads the request and returns a response based solely on the URL path, regardless of any additional request data'],
    'The same URL can give different answers because the server also reads the rest of the request, such as a session cookie or an Authorization header, to know who is asking.'),
  mcq(12, 2, 'git', 'Which statement best describes Git?',
    'A tool that records snapshots of your project so you can return to any previous version',
    ['A version control tool where developers review each other\'s code through pull requests', 'A version control system that saves copies of your project at regular intervals', 'A cloud-based tool for hosting repositories and maintaining code', 'A tool that records snapshots of your project so you can return to any previous version'],
    'Git records a snapshot each time you commit (not at regular intervals). Pull requests and hosting in the cloud are GitHub features, not Git.'),
  mcq(13, 2, 'git', 'You committed changes but your teammate cannot see them on GitHub. What is the most likely explanation?',
    'The changes have not been pushed',
    ['Git requires a pull request for personal repos', 'The changes have not been pushed', 'The commit message was not descriptive enough', 'The local branch has diverged from HEAD and the commit was not staged correctly'],
    'git commit only saves the snapshot in your local repository. git push sends the commits to GitHub, where others can see them.'),
  mcq(14, 2, 'git', 'You want to start from a shared project online, make your own copy under your account, and propose changes back later. What action fits best?',
    'Fork it, then work in your own repository',
    ['Rebase the clone, create a branch, and open a pull request from your local branch', 'Fork it, then work in your own repository', 'Clone it and commit directly to the original repository', 'Stash it, then push the stash'],
    'A fork is your own copy of someone else\'s repository on GitHub. You work there and later propose your changes back to the original with a pull request.'),
  { ...open, id: 'ex23-15', realNo: 15, week: 2, topic: 'git',
    q: 'A student is working on their React project while traveling by train. Before boarding, the student received a phone call from a colleague who said they had created a new branch called \'navbar-layout\' and asked for a code review. On the train the student noticed that there is no internet connection there. During the journey, the student attempts the following actions (see the list). Answer the questions: a) Which of these actions would succeed on the train, and which would fail? For each action, briefly explain why. b) Describe the areas that Git uses to manage your work, and explain how your changes move through these areas as you work on a project.',
    code: `1. Opens the project folder
2. Runs \`git log\` to view the commit history
3. Runs \`git pull\`
4. Runs \`git branch footer\` and \`git checkout footer\`
5. Edits App.jsx and Footer.jsx
6. Runs \`git status\`
7. Runs \`git add .\`
8. Runs \`git commit -m "feat: add footer"\`
9. Runs \`git push origin footer\`
10. Runs \`git checkout main\`
11. Runs \`git checkout navbar-layout\`
12. Runs \`git merge footer\` to merge own work into main
13. Opens the pull request on GitHub to leave review comments on the colleague's code
14. Runs \`git log\` to view the updated commit history`,
    keyPoints: [
      'a) Succeed (local, no network needed): 1 open folder, 2 git log, 4 create and switch to a branch, 5 edit files, 6 git status, 7 git add, 8 git commit, 10 checkout main, 12 merge footer into main, 14 git log (the history is stored locally in .git)',
      'a) Fail: 3 git pull (must download from the remote), 9 git push (must upload to GitHub), 13 opening the pull request on GitHub (a website)',
      'a) Fail: 11 git checkout navbar-layout, because the branch was created on GitHub after the student last fetched; the local repository does not know it (the pull in step 3 failed)',
      'b) Working directory (working tree): the files you edit; changes here are untracked or modified',
      'b) Staging area (index): git add puts the changes you want into the next commit',
      'b) Local repository: git commit stores the staged snapshot in the history on your computer',
      'b) Remote repository (for example GitHub): git push sends your commits there; git pull / git fetch bring others\' commits from there into your local repository',
    ],
    model: 'a) Git keeps the whole history on the computer, so everything that does not talk to GitHub works offline. 1 Opening the folder succeeds. 2 git log succeeds: the history is in the local .git folder. 3 git pull fails: it has to download new commits from the remote, which needs the internet. 4 git branch footer and git checkout footer succeed: branches are local. 5 Editing App.jsx and Footer.jsx succeeds. 6 git status succeeds. 7 git add . succeeds (staging is local). 8 git commit succeeds: the commit is stored in the local repository. 9 git push origin footer fails: it must upload to GitHub. 10 git checkout main succeeds. 11 git checkout navbar-layout fails: the colleague created the branch on GitHub, and because the student has not fetched since (the pull in step 3 failed), the local repository does not know the branch, so Git cannot find it. 12 git merge footer succeeds: merging two local branches is local. 13 Opening the pull request on GitHub fails: it is a website. 14 git log succeeds and now shows the merged commit. b) Git uses four areas. The working directory is the project folder with the files you edit. The staging area (index) collects the changes for the next commit: git add moves changes there. The local repository (.git) is the history of commits on your computer: git commit turns the staged changes into a new snapshot. The remote repository (GitHub) is the shared copy: git push uploads your commits, git fetch / git pull download other people\'s commits (pull also merges them). So a change goes: edit (working directory) → git add (staging) → git commit (local repository) → git push (remote).' },
  mcq(16, 2, 'git', 'A developer finished implementing a search feature that lets users filter products by name and added a search icon to the navigation bar. Which of the following commit messages best follows conventional commit style?',
    'feat: add product search and update navigation',
    ['fix: add product search and update navigationk', 'changes: add product search and update navigation', 'feat: add product search and update navigation', 'finished: add product search and update navigation'],
    'Conventional commits start with a type: feat for a new feature, fix for a bug fix (also docs, style, refactor, test, chore). A new search feature is feat.'),
  mcq(17, 2, 'git', 'A developer adds the database password to a .env file at the root of the project. They then run git add . and commit. What is the most important reason this is problematic?',
    'The credentials are in the repository history, and visible in past commits',
    ['Git will reject the commit because .env files are reserved for environment configuration', 'The commit will fail because Git does not allow files with no extension.', 'The .env file format is not supported by most text editors and may cause encoding errors.', 'The credentials are in the repository history, and visible in past commits'],
    'Git commits it without complaint, and once it is in a commit it stays in the history (even if the file is deleted later). Anyone with the repository can read the password. Put .env in .gitignore and change the password if it was pushed.'),
  mcq(18, 4, 'jsapi', 'A developer writes a function that fetches user data and immediately logs it to the console. When they run it, the console shows undefined instead of the expected data. Which explanation is most likely?',
    'The function tried to use the data before the server had finished responding, the fetch call was not awaited',
    ['The server requires a POST request instead of GET for this endpoint', 'console.log does not work inside async functions', 'The function tried to use the data before the server had finished responding, the fetch call was not awaited', 'The API returned an empty response because the URL was incorrect'],
    'fetch is asynchronous: it returns a Promise right away. Without await (or .then), the code logs before the response has arrived.'),
  mcq(19, 4, 'jsapi', 'A developer wants to fetch data from an API and use it to update the page. They write the code but forget to mark the wrapping function as async. What is the most likely consequence?',
    'They cannot use await inside the function, the code will throw a syntax error',
    ['The fetch call is skipped entirely and no request is made', 'The browser blocks all other code until the fetch completes', 'They cannot use await inside the function, the code will throw a syntax error', 'The data is fetched but stored in a global variable instead of the local one'],
    'await is only allowed inside an async function (or at the top level of a module). Using it in a normal function is a SyntaxError, so the code does not run.'),
  { ...open, id: 'ex23-20', realNo: 20, week: 4, topic: 'jsdom',
    q: 'Below is an HTML document and a JavaScript code that runs after the HTML has loaded. Three possible structures after the JavaScript has run are shown below the code. Answer the questions: a) Which of the three HTML structures (1, 2, or 3) does the code produce? Choose one and justify your choice. b) Explain what the DOM is and how it represents an HTML document in a browser.',
    code: `<!-- HTML before JavaScript runs -->
<body>
    <div id='main'>
        <p>Welcome!</p>
    </div>
    <div id='content'>
        <p>Loading...</p>
    </div>
</body>

<script>
const content = document.createElement('div');

const message = document.createElement('p');
message.textContent = 'New notification';

const button = document.createElement('button');
button.textContent = 'Dismiss';

content.appendChild(message);
content.appendChild(button);

const main = document.querySelector('#main');
main.appendChild(content);
</script>

Three possible structures after the JavaScript has run:

1)
<body>
    <div id='main'>
        <p>Welcome!</p>
        <div>
            <p>New notification</p>
            <button>Dismiss</button>
        </div>
    </div>
    <div id='content'>
        <p>Loading...</p>
    </div>
</body>

2)
<body>
    <div id='main'>
        <p>Welcome!</p>
    </div>
    <div id='content'>
        <p>Loading...</p>
        <p>New notification</p>
        <button>Dismiss</button>
    </div>
</body>

3)
<body>
    <div id='main'>
        <p>Welcome!</p>
    </div>
    <div>
        <p>New notification</p>
        <button>Dismiss</button>
    </div>
    <div id='content'>
        <p>Loading...</p>
    </div>
</body>`,
    keyPoints: [
      'a) Structure 1',
      'a) document.createElement(\'div\') makes a NEW, empty div; the variable is called content, but it has nothing to do with the existing div id="content" (it is not selected with querySelector)',
      'a) The p ("New notification") and the button ("Dismiss") are appended inside the new div, and main.appendChild(content) adds that div as the LAST child of div#main, after <p>Welcome!</p>; div#content is not changed',
      'a) Not 2 (that would need document.querySelector(\'#content\')) and not 3 (appendChild puts the element inside main, not next to it)',
      'b) The DOM (Document Object Model) is the browser\'s in-memory model of the page, built from the HTML: a tree of objects (nodes) for the document, its elements, attributes and text, with parent and child relationships',
      'b) JavaScript reads and changes the page through the DOM API (querySelector, createElement, appendChild, textContent); when the DOM changes, the browser updates what is shown, without changing the HTML file',
    ],
    model: 'a) The code produces structure 1. document.createElement(\'div\') creates a brand-new, empty div element that is not in the page yet. The variable happens to be called content, but it is not the existing div with id="content": that one would have to be found with document.querySelector(\'#content\'). The new p (text "New notification") and button (text "Dismiss") are appended inside the new div. Then document.querySelector(\'#main\') finds the div with id main, and main.appendChild(content) adds the new div as its last child, after <p>Welcome!</p>. The div#content with "Loading..." stays as it was. Structure 2 would require appending to div#content, and structure 3 would require inserting the div next to main (for example with main.after(content)), not inside it. b) The DOM (Document Object Model) is how the browser represents an HTML document in memory: as a tree of objects called nodes. The document is the root; under it are the html, head and body elements, their child elements, attributes and text nodes, each with a parent and children, just like the nesting in the HTML. JavaScript can find, create, change and remove nodes through the DOM API (document.querySelector, createElement, appendChild, textContent ...). When the DOM changes, the browser re-renders the page; the original HTML file is not changed.' },
  mcq(21, 1, 'web', 'Which of the following statements is correct?',
    'The Internet is the network infrastructure, the Web is an application that runs on it',
    ['The Web is the network infrastructure, while the Internet is an application on top of it', 'The Internet and the Web were developed at the same time to serve different purposes', 'The Web existed before the Internet and later became part of its infrastructure', 'The Internet is the network infrastructure, the Web is an application that runs on it'],
    'The Internet (from the 1960s-80s) is the global network of computers. The Web (1989-91, Tim Berners-Lee) is one service on top of it: pages linked by URLs and sent with HTTP.'),
  mcq(22, 1, 'css', 'What does "cascading" refer to in CSS?',
    'Multiple styles can apply to the same element, and conflicts are resolved by specificity and source order rules',
    ['CSS files are loaded in the order they are linked, and the linking order overrides all the specificity rules', 'Multiple styles can apply to the same element, and conflicts are resolved by specificity and source order rules', 'CSS files are loaded in the order they are linked, and the linking order alone determines which styles are applied', 'Browser default styles override custom developer styles'],
    'The cascade decides which rule wins when several target the same element: importance and origin first, then specificity (id beats class beats element), then source order (the later one wins).'),
  mcq(23, 4, 'jsdom', 'Which of these describes an event listener\'s role in JavaScript?',
    'It listens for user actions on a DOM element and runs a function when the event occurs',
    ['It listens to the DOM for structural changes and automatically re-renders affected elements when they are modified', 'It listens for events happening on the server and updates the DOM when new data arrives', 'It listens for events dispatched between components in a single-page application and routes them to the correct handler', 'It listens for user actions on a DOM element and runs a function when the event occurs'],
    'element.addEventListener(\'click\', handler) runs handler every time that event (click, input, submit ...) happens on that element.'),
  mcq(24, 5, 'react', 'Which best describes JSX in React?',
    'An extension allowing HTML-like code in JavaScript',
    ['A syntax that must be transpiled before the browser can run it, because browsers cannot execute React.createElement() calls natively', 'An extension allowing HTML-like code in JavaScript', 'An HTML-like syntax that Babel transpiles to JavaScript in the end user\'s browser', 'A language that Babel compiles into HTML files which the browser renders directly'],
    'JSX is a syntax extension of JavaScript for writing HTML-like markup. It is transpiled to React.createElement calls at build time (by Babel or Vite), not in the user\'s browser, and browsers can run createElement calls; what they cannot run is JSX itself.'),
  { ...open, id: 'ex23-25', realNo: 25, week: 5, topic: 'react',
    q: 'Below is a React component for a simple note editor. The user can type a note in the text area, save it to a log with the Save to log button, or clear it with the Clear button. The developer reports that the app crashes with the error: Too many re-renders. React limits the number of renders to prevent an infinite loop. Answer the questions: a) Which line in the component\'s return statement causes the problem and why? How would you fix the problem? b) Explain what useState returns and how the state is updated in React.',
    code: `function NoteEditor() {
    const [note, setNote] = useState('');
    const [log, setLog] = useState([]);

    const clearNote = () => {
        setNote('');
    };

    const addToLog = () => {
        setLog([...log, note]);
        setNote('');
    };

    return (
        <div>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <button onClick={clearNote()}>Clear</button>
            <button onClick={addToLog}>Save to log</button>
            <ul>
                {log.map((entry, i) => (
                    <li key={i}>{entry}</li>
                ))}
            </ul>
        </div>
    );
}`,
    keyPoints: [
      'a) Line 20: <button onClick={clearNote()}>Clear</button>',
      'a) clearNote() has parentheses, so it is CALLED during rendering instead of being passed as the click handler; it calls setNote(\'\'), a state update during render, which causes another render, which calls clearNote() again: an endless loop',
      'a) Fix: pass the function without calling it: onClick={clearNote} (or onClick={() => clearNote()}), like the Save button does with onClick={addToLog}',
      'b) useState(initial) returns an array of two things: the current state value and a setter function, taken out with array destructuring: const [note, setNote] = useState(\'\')',
      'b) The initial value is used only on the first render; state is changed only by calling the setter (never by assigning to the variable or changing the array)',
      'b) Calling the setter tells React to re-render the component; in the next render the variable has the new value (not immediately in the same render); for arrays and objects you create a new value, for example setLog([...log, note])',
    ],
    model: 'a) The problem is line 20, <button onClick={clearNote()}>Clear</button>. Because of the parentheses, clearNote is called immediately while the component renders, and its return value (undefined) is given to onClick. clearNote calls setNote(\'\'), a state update during rendering. A state update makes React render the component again, which calls clearNote() again, and so on: an infinite loop, which React stops with "Too many re-renders". Fix: pass the function itself so React calls it only on a click: <button onClick={clearNote}>Clear</button>, or with an arrow function onClick={() => clearNote()}. The Save button already does it right with onClick={addToLog}. b) useState takes the initial value and returns an array with two elements: the current value of the state and a function to update it, here const [note, setNote] = useState(\'\') and const [log, setLog] = useState([]). The initial value is used only on the first render. The state must not be changed directly (note = \'x\' or log.push(x) would not update the screen). Instead you call the setter with the new value; React stores it and re-renders the component, and in that next render note (or log) has the new value. For arrays and objects you give a new copy, for example setLog([...log, note]) adds the note to a new array.' },
]
