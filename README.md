[![Scheduled CDN Upload](https://github.com/autonity/partner-registry/actions/workflows/scheduled-deployment.yaml/badge.svg)](https://github.com/autonity/partner-registry/actions/workflows/scheduled-deployment.yaml)
# ECOSYSTEM Partner Registry

How to add your project to our [Partner-Registry](https://github.com/autonity/partner-registry) repo.

## Adding your project to the Partner Registry
Firstly you need to fork the registry [repo](https://github.com/autonity/partner-registry), clone it locally and open in your favorite editor.

#### Step 1: Select the `partners/` folder.

#### Step 2: In the `partners/` folder create a folder named according to your project.

#### Step 3: In your project folder you need to add two files: `logo.png` & `info.json`.

The `info.json` file looks like this:

``` typescript
export interface Partner {
    name: string; //40 characters max
    shortDescription: string; // 75 character max description
    longDescription: string; // 250 character max description
    tags: string[]; //keywords that best describe your project, max 5 each one no more then 20 characters
    url: string; // must be a https url
}
```

The `logo.png` must be no more than 125x125px

#### Step 4: Create a pull-request containing your updated data.

#### Step 5: Submit Your Pull Request
**When you submit your PR, please use the following naming convention for the title:**
- **Title Format**: `Add <Project Name> to Partner Registry`
- **Example**: `Add MyProject to Partner Registry`

If you are successfull, your PR will have a `new-partner` label applied to it:
![Success Bot Label](resources/tutorial/success-label.png)

And a success comment
![Success Bot Comment](resources/tutorial/success-bot-comment.png)

If your PR failed validity checks, a bot will comment on the reasons why
![Failure bot comment](resources/tutorial/failure-bot-comment.png)

### Development

This section will focus on setting up the project locally.

#### Prerequisites
- Node.js
- npm
- typescript

#### Setup

1. Clone the repository
2. Run `npm install`

Check the `package.json` for more scripts.

