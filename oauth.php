<?php
  require_once __DIR__ . '/vendor/autoload.php';
  use MediaWiki\OAuthClient\ClientConfig;
  use MediaWiki\OAuthClient\Consumer;
  use MediaWiki\OAuthClient\Client;

  $conf = new ClientConfig( 'https://en.wikipedia.org/w/index.php?title=Special:OAuth' );
  $conf->setConsumer( new Consumer( 'abef0f582ef20b645630e76cfcfef67b', require_once __DIR__ . '/.secret.php' ) );
  return new Client( $conf );
?>
