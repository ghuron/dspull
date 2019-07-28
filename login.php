<?php
  $client = require_once __DIR__ . '/../oauth.php';
  $client->setCallback(str_replace('login', 'callback', $_SERVER['HTTP_X_FORWARDED_PROTO'].'://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']));
  list( $authUrl, $token ) = $client->initiate();
  session_start();
  $_SESSION['request_key'] = $token->key;
  $_SESSION['request_secret'] = $token->secret;
  header('Location: '.$authUrl);
?> 
