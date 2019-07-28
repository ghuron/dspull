<?php
  $client = require_once __DIR__ . '/../oauth.php';
  use MediaWiki\OAuthClient\Token;

  session_start();
  $requestToken = new Token( $_SESSION['request_key'], $_SESSION['request_secret'] );
  $accessToken = $client->complete( $requestToken,  $_GET['oauth_verifier'] );
  $_SESSION['access_key'] = $accessToken->key;
  $_SESSION['access_secret'] = $accessToken->secret;
  unset( $_SESSION['request_key'], $_SESSION['request_secret'] );

  header('Location: '.'edit.php');
?> 
