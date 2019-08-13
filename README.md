Downstream pull
===============
This repository contains the code of a [Wikimedia Tools Labs](https://tools.wmflabs.org) tool intended to streamline deployment of changes for [Multilingual Templates and Modules](https://www.mediawiki.org/wiki/Multilingual_Templates_and_Modules). It is live at https://tools.wmflabs.org/dspull/

## Install
1. [Request](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose) a new OAuth application
2. Create .secret.php file with ``<?php return "<oauth-secret-token>"; ?>``
3. Run ``composer upgrade`` to install dependencies
