[![Scheduled CDN Upload](https://github.com/autonity/partner-registry/actions/workflows/scheduled-deployment.yaml/badge.svg)](https://github.com/autonity/partner-registry/actions/workflows/scheduled-deployment.yaml) [![Tests](https://github.com/autonity/partner-registry/actions/workflows/unit-tests.yaml/badge.svg?branch=develop)](https://github.com/autonity/partner-registry/actions/workflows/unit-tests.yaml)

# Adding your Project to the ECOSYSTEM Partner Registry

Firstly you need to fork the registry [repo](https://github.com/autonity/partner-registry), clone it locally and open in your favorite editor.

### Step 1: Select the `partners/` folder.

### Step 2: In the `partners/` folder create a folder named according to your project.

### Step 3: In your project folder you need to add light and dark images and a config file.
These are:
#### - info.yaml

```yaml
name: 'Test Partner' # 20 characters max
short_description: 'Test Partner' # 60 character max description
long_description: 'This is a test and is ignored by the uploader' # 175 character max
tags: # max 3 tags, the most relevant should be listed first
    - 'defi' # no more then 12 characters per tag
    - 'infra'
url: 'https://www.autonity.org' # must be a valid https url
```

#### - thumbnail_light.png & thumbnail_dark.png:
These must be **no more** than 196x160px. This is used when viewing your project in the grid list.

#### - banner_light.png & banner_dark.png
These must be **no more** than 274x105px. This is used when your product is featured and is in the carousel list.

### Step 4: Create a pull-request containing your updated data.

### Step 5: Submit Your Pull Request

---

If your PR fails validation checks, please check the github action, it will have the reason why. This will be in the **Check partners are valid** section of the github action.

![Failure bot comment](resources/tutorial/gha.png)
