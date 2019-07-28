<?php
  $client = require_once __DIR__ . '/../oauth.php';
  use MediaWiki\OAuthClient\Token;

  session_start();
  $accessToken = new Token( $_SESSION['access_key'], $_SESSION['access_secret'] );
  $editToken = json_decode( $client->makeOAuthCall(
  	$accessToken,
	"https://ru.wikipedia.org/w/api.php?action=query&meta=tokens&format=json"
  ))->query->tokens->csrftoken;
  echo 'csrf edit token:'.$editToken;
?> 
