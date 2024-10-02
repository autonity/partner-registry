### This is an example partner

To submit your own project, add a project folder to the `partners/` directory.

#### In your project folder you need to add two files: `logo.png` & `info.json`.

### The logo.png file must be no more then 125x125px

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
