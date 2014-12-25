System.config({
  "paths": {
    "*": "*.js",
    "~/*": "app/*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "angular": "github:angular/bower-angular@1.3.8",
    "angular-ui-router": "github:angular-ui/ui-router@0.2.13",
    "ionic": "github:driftyco/ionic-bower@0.9.26",
    "github:angular-ui/ui-router@0.2.13": {
      "angular": "github:angular/bower-angular@1.3.8"
    }
  }
});

