<p align="center">
    <img src="./extension/assets/perfssr_logo.png" alt="PerfSSR">
</p>

# PerfSSR

PerfSSR is an open-source Chrome Developer Tool that enhances performance and observability for Next.js applications. It offers real-time performance analytics, providing valuable and comprehensive insights into various aspects of the application.

![perfssr](./assets/devtool-sample.gif?raw=true "Title")

---

## Tech Stack

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![GoogleChrome](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)
![MUI](https://img.shields.io/badge/Material%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Webpack](https://img.shields.io/badge/webpack-%238DD6F9.svg?style=for-the-badge&logo=webpack&logoColor=black)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Babel](https://img.shields.io/badge/Babel-F9DC3e?style=for-the-badge&logo=babel&logoColor=black)
![eslint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)

---

## Motivation

Fetches made server-side get logged in your terminal not the browser. PerfSSR Dev Tool solves this by showing server-side fetch requests in browser alongside the Chrome Network tab.

Next.js already instruments using [OpenTelemetry](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry) for us out of the box so we can just access their built-in spans.

Credit to [NetPulse](https://github.com/oslabs-beta/NetPulse) for this idea.


![fetchrepo](./assets/repo-fetching.png?raw=true "repo fetching")
![fetchstore](./assets/store-fetching.png?raw=true "store fetching")


---

## Setup

### Prerequisites

1. [Google Chrome](https://www.google.com/chrome/)
2. Ensure you have [React Dev Tools](https://react.dev/learn/react-developer-tools) installed
3. In your project directory `npm install perfssr --save-dev`
4. Install our [PerfSSR Chrome Extension](#chrome-extension-installation)
5. As of the current Next.js version [13.4.4], [instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation) is an experimental hook so it must be included in the `next.config.js` file. Add the following code to your next config object.

   ```javascript
   experimental: {
     instrumentationHook: true
   }
   ```

6. Create a file in your project root directory called `instrumentation.ts`. This file will be loaded when Next.js dev server runs and sees that instrumentation is enabled. Within this file we need to import a file that we'll be creating in the next step that starts tracing the Next.js application

   ```javascript
   export async function register() {
     //OpenTelemetry APIs are not compatible with edge runtime
     //need to only import when our runtime is nodejs
     if (process.env.NEXT_RUNTIME === "nodejs") {
       //Import the script that will start tracing the Next.js application
       //In our case it is perfssr.ts
       //Change it to your own file name if you named it something else
       await import("./perfssr");
     }
   }
   ```

7. Create another file [.ts or .js] to your project root directory this can be named anything you'd like. We have ours called `perfssr.ts`

   1. Inside `perfssr.ts` copy and paste this block of code

   ```javascript
   import { NodeSDK } from "@opentelemetry/sdk-node";
   import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
   import { Resource } from "@opentelemetry/resources";
   import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
   import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

   const sdk = new NodeSDK({
     resource: new Resource({
       [SemanticResourceAttributes.SERVICE_NAME]: "next-app",
     }),

     spanProcessor: new SimpleSpanProcessor(
       new OTLPTraceExporter({
         //all traces exported to express server on port 4000
         url: `http://localhost:4000`,
       })
     ),
   });

   sdk.start();
   ```
      2. You will need to add all these OpenTelemetry modules as dependencies to your `package.json`
   ```javascript
    npm i --save-dev @opentelemetry/exporter-trace-otlp-http @opentelemetry/resources @opentelemetry/sdk-node @opentelemetry/sdk-trace-node @opentelemetry/semantic-conventions
   ```
   

8. Create a `.env` file in the root of your project directory. By default Next.js only creates spans for the API routes, but we want more information than that! To open it up, Next.js looks for a value set in `process.env` Add the line `NEXT_OTEL_VERBOSE=1` to your `.env` file.

9. Include another script line to your `package.json` file

```javascript
    "perfssr": "node ./node_modules/perfssr/server.js & next dev"
```

10. Run PerfSSR by running the command `npm run perfssr` within your terminal.

### Chrome Extension Installation

1. Clone the PerfSSR repo onto your local machine

```
git clone https://github.com/oslabs-beta/perfSSR.git
```

2. Install dependencies and build the PerfSSR application locally

```
npm install
npm run build
```

3. Add PerfSSR to your Chrome extensions

- Navigate to chrome://extensions
- Select Load Unpacked
- Turn on 'Allow access to file URLs' in extension details
- Choose PerfSSR/dist
- Navigate to your application in development mode
- Open up your project in Google Chrome

4. Navigate to the PerfSSR panel. Click on the **Start PerfSSR** button will automatically refreshes the page and starts the extraction of performance data of the currently inspected webpage

- Click on **Regenerate Metrics** will refresh the page to get updated rendering data
- Click on **Clear Network Data** under the Server-side Fetching Summary table will clear all the current requests logged so far

**Note**: PerfSSR is intended for analyzing and providing performance insights into Next.js applications **in development mode** running on `localhost:3000`

## Examples

To see examples of how to set up your app, we've included a sample app in the `examples` folder.

## Contributors

[James Ye](https://github.com/ye-james) | [Summer Pu](https://github.com/summep) | [Jessica Vo](https://github.com/jessicavo) | [Jonathan Hosea](https://github.com/jhosea92)
