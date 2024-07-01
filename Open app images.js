$('img[name^="i_"]').each(function() {
        // Get the source (src) attribute of each image
        var imageUrl = $(this).attr('src').replace("cdnp","cdn");

        // Open each image in a new tab or window
        window.open(imageUrl, '_blank');
      });
