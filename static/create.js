"use strict";

String.prototype.replaceAll = function ( search, replacement ) {
    var target = this;
    return target.split( search ).join( replacement );
};

$( document ).ready( () => {
    var linksDisplay = $( '#created_links_display' ),
        linksCounter = $( '#created_links_counter' ),
        urlField = $( '#url' ),
        createButton = $( '#btn_create' ),
        modal = $( '#popup-modal' ),
        modalHeading = $( '#popup-modal-heading' ),
        modalBody = $( '#popup-modal-body' ),
        createdUrls = [],
        clearHistoryButton = $( '#btn_clear_history_modal' ),
        loadBar = $( '#load-bar' ),
        acceptCookiesModal = $( '#accept-cookies-modal' ),
        acceptCookiesSwitch = $( '#cookie-switch' );
    var acceptedCookies = false;

    const linksDisplayTemplate =
        `<li class="list-group-item d-flex justify-content-between lh-condensed">
        <div>
            <a href="/l/{%id%}">
                <h5>{%id%}</h5>
            </a>
            <small class="text-muted">{%url%}</small>
        </div>
    </li>`;

    createButton.on( 'click', ( event ) => {
        let targetUrl = urlField.val();
        if ( targetUrl.length === 0 ) {
            showModal( 'No url specified', 'To create a new url you firstly need enter a destination url' );
        } else {
            urlField.val( '' );
            loadBar.show();
            $.ajax( {
                'url': '/api/create',
                'dataType': 'json',
                'async': true,
                'type': 'POST',
                'data': {
                    'url': targetUrl
                },
                'error': function ( jqXHR, textStatus, errorThrown ) {
                    showModal( 'An error has occured',
                        `<p>
                Text-Status: ${textStatus}<br>
                <br>` +
                        ( errorThrown ? ( 'Error thrown: ' + errorThrown ) : '' ) +
                        '</p>' );
                },
                'success': function ( data, textStatus ) {
                    if ( data.state === 'error' ) {
                        showModal( 'An error has occured',
                            `<p>
                        ${data.message}
                        <p>`
                        );
                    } else if ( data.state === 'invalid' ) {
                        showModal( 'The submitted url is invalid!',
                            `<p>
                    ${data.message}
                    <p>`
                        );
                    } else if ( data.state === 'success' ) {
                        linkCreated( targetUrl, data.id );
                    }
                },
                'complete': function () {
                    loadBar.hide();
                }
            } );
        }
    } );

    clearHistoryButton.on( 'click', ( event ) => {
        createdUrls = [];
        Cookies.remove( 'createdUrls', { 'path': '/' } );
        linksDisplay.html( '' );
        linksCounter.text( '0' );
    } );

    function linkCreated( url, id ) {
        for ( let index = 0; index < createdUrls.length; index++ ) {
            if ( createdUrls[ index ].id === id ) {
                showModal( 'You have already created a link with that url!', `Shortenend link: <a href="/l/${id}">${id}</a>` );
                return;
            }
        }
        createdUrls.push(
            {
                'url': url,
                'id': id,
                'time': new Date().toISOString()
            }
        );
        linksCounter.text( createdUrls.length );
        linksDisplay.prepend( linksDisplayTemplate.replaceAll( '{%id%}', id ).replaceAll( '{%url%}', url ) );
        if (acceptedCookies) {
            Cookies.set( 'createdUrls', JSON.stringify( createdUrls ),
                {
                    'expires': 365 * 50,
                    'path': '/'
                }
            );
        }
    }

    function showModal( heading, body ) {
        modalHeading.text( heading );
        modalBody.html( body );
        modal.modal( 'show' );
    }

    // https://stackoverflow.com/a/478239
    urlField.keypress( ( e ) => {
        if ( e.which == 10 || e.which == 13 ) { // Button ids for enter
            createButton.click();
        }
    } );

    // Get cookies
    if ( Cookies.get( 'acceptedCookies' ) ) {
        if ( Cookies.get( 'createdUrls' ) ) {
            createdUrls = JSON.parse( Cookies.get( 'createdUrls' ) );
            createdUrls.forEach( createdUrl => {
                linksDisplay.prepend( linksDisplayTemplate.replaceAll( '{%id%}', createdUrl.id ).replaceAll( '{%url%}', createdUrl.url ) );
            } );
            linksCounter.text( createdUrls.length );
        }
    } else {
        acceptCookiesModal.modal( {
            keyboard: false,
            backdrop: 'static'
        } );
        acceptCookiesModal.modal( 'show' );
        acceptCookiesModal.on( 'hide.bs.modal', ( event ) => {
            acceptedCookies = acceptCookiesSwitch.is( ':checked' );
            if ( acceptedCookies ) {
                Cookies.set( 'acceptedCookies', 'true',
                    {
                        'expires': 365 * 50,
                        'path': '/'
                    } );
            }
        } );
    }
} );