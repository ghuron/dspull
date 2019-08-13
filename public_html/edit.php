<?php
  $client = require_once __DIR__ . '/../oauth.php';
  use MediaWiki\OAuthClient\Client;
  use MediaWiki\OAuthClient\ClientConfig;
  use MediaWiki\OAuthClient\Consumer;
  use MediaWiki\OAuthClient\Token;
  $apiUrl = 'https://' . $_POST['site'] . '.wikipedia.org/w/api.php';
  session_start();
  $accessToken = new Token( $_SESSION['access_key'], $_SESSION['access_secret'] );
  $editToken = json_decode( $client->makeOAuthCall(
  	$accessToken,
	$apiUrl . "?action=query&meta=tokens&format=json"
  ))->query->tokens->csrftoken;

  $ident = $client->identify( $accessToken );

  $apiParams = [
	'action' => 'edit',
	'title' => $_POST['title'],
	'section' => '0',
	'summary' => $_POST['summary'],
	'text' => $_POST['text'],
	'token' => $editToken,
	'format' => 'json',
  ];
  
  $editResult = json_decode( $client->makeOAuthCall(
	$accessToken,
	$apiUrl,
	true,
	$apiParams
  ) );

  print_r( $editResult );

?> 
