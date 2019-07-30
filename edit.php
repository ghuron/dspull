<?php
  $client = require_once __DIR__ . '/../oauth.php';
  use MediaWiki\OAuthClient\Client;
  use MediaWiki\OAuthClient\ClientConfig;
  use MediaWiki\OAuthClient\Consumer;
  use MediaWiki\OAuthClient\Token;
  $apiUrl = 'https://en.wikipedia.org/w/api.php';
  session_start();
  $accessToken = new Token( $_SESSION['access_key'], $_SESSION['access_secret'] );
  $editToken = json_decode( $client->makeOAuthCall(
  	$accessToken,
	"https://en.wikipedia.org/w/api.php?action=query&meta=tokens&format=json"
  ))->query->tokens->csrftoken;

  $ident = $client->identify( $accessToken );
  echo 'csrf edit token: '.$editToken.'<br>'; 
  echo "You are authenticated as $ident->username.\n\n<br>";
 
  $apiParams = [
	'action' => 'edit',
	'title' => 'User:' . $ident->username,
	'section' => 'new',
	'summary' => 'Hello World',
	'text' => 'I am learning to use the <code>mediawiki/oauthclient</code> library.',
	'token' => $editToken,
	'format' => 'json',
  ];
  
  $editResult = json_decode( $client->makeOAuthCall(
	$accessToken,
	$apiUrl,
	true,
	$apiParams
  ) );
  //echo "\n== You made an edit ==\n\n";
  print_r( $editResult );

?> 
