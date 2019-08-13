<?php
  require_once __DIR__ . '/vendor/autoload.php';
  use MediaWiki\OAuthClient\ClientConfig;
  use MediaWiki\OAuthClient\Consumer;
  use MediaWiki\OAuthClient\Client;

  $conf = new ClientConfig( 'https://en.wikipedia.org/w/index.php?title=Special:OAuth' );
  $conf->setConsumer( new Consumer( '92e5598f6608d95b2eb4645420b747b5', require_once __DIR__ . '/.secret.php' ) );
  return new Client( $conf );
?>
