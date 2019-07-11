"use strict";
var linksDisplay = $( '#created_links_display' ),
    linksCounter = $( '#created_links_counter' ),
    urlField = $( '#url' ),
    createButton = $( '#btn_create' ),
    modal = $( '#popup-modal' ),
    modalHeading = $( '#popup-modal-heading' ),
    modalBody = $( '#popup-modal-body' ),
    createdUrls = [],
    clearHistoryButton = $( '#btn_clear_history' ),
    loadBar = $( '#load-bar' );

const linksDisplayTemplate =
    `<li class="list-group-item d-flex justify-content-between lh-condensed">
        <div>
            <a href="/l/{%id%}">
                <h5>{%id%}</h5>
            </a>
            <small class="text-muted">{%url%}</small>
        </div>
    </li>`;

String.prototype.replaceAll = function ( search, replacement ) {
    var target = this;
    return target.split( search ).join( replacement );
};

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
            'error': function(jqXHR, textStatus, errorThrown) {
                showModal('An error has occured',
                `<p>
                Text-Status: ${textStatus}<br>
                <br>` +
                (errorThrown ? ('Error thrown: ' + errorThrown) : '') + 
                '</p>');
            },
            'success': function ( data, textStatus ) {
                if ( data.state === 'error' ) {
                    showModal( 'An error has occured',
                        `<p>
                        ${data.message}
                        <p>`
                    );
                } else if (data.state === 'invalid') {
                    showModal( 'The submitted url is invalid!',
                    `<p>
                    ${data.message}
                    <p>`
                );
                } else if (data.state === 'success') {
                    linkCreated( targetUrl, data.id );
                }
            },
            'complete':  function() {
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
    Cookies.set( 'createdUrls', JSON.stringify( createdUrls ),
        {
            'expires': 365 * 50,
            'path': '/'
        }
    );
}

function showModal( heading, body ) {
    modalHeading.text( heading );
    modalBody.html( body );
    modal.modal( 'show' );
}

// Get cookies
if ( Cookies.get( 'createdUrls' ) ) {
    createdUrls = JSON.parse( Cookies.get( 'createdUrls' ) );
    createdUrls.forEach( createdUrl => {
        linksDisplay.prepend( linksDisplayTemplate.replaceAll( '{%id%}', createdUrl.id ).replaceAll( '{%url%}', createdUrl.url ) );
    } );
    linksCounter.text( createdUrls.length );
}