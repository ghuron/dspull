<?php
  require_once __DIR__ . '/vendor/autoload.php';
  use MediaWiki\OAuthClient\ClientConfig;
  use MediaWiki\OAuthClient\Consumer;
  use MediaWiki\OAuthClient\Client;

  $conf = new ClientConfig( 'https://en.wikipedia.org/w/index.php?title=Special:OAuth' );
  $conf->setConsumer( new Consumer( 'ef0ed4393a4f093a3a6f92563e80e28f', require_once __DIR__ . '/.secret.php' ) );
  return new Client( $conf );
?>
