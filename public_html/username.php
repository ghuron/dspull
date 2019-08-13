<?php
	$client = require_once __DIR__ . '/../oauth.php';
	use MediaWiki\OAuthClient\Token;

	session_start();
  $accessToken = new Token( $_SESSION['access_key'], $_SESSION['access_secret'] );
  $ident = $client->identify( $accessToken );


	echo $ident->username;

?> 
