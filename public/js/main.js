$(document).ready(function() {
  if ($('#employeesTable').length) {
    $('#employeesTable').DataTable({
      pageLength: 10,
      ordering: true,
      info: true,
      language: {
        searchPlaceholder: "Search employees..."
      }
    });
  }

  if ($('#categoriesTable').length) {
    $('#categoriesTable').DataTable({
      pageLength: 5,
      ordering: true,
      info: false,
      lengthChange: false,
      language: {
        searchPlaceholder: "Search categories..."
      }
    });
  }

  if ($('#branchesTable').length) {
    $('#branchesTable').DataTable({
      pageLength: 5,
      ordering: true,
      info: false,
      lengthChange: false,
      language: {
        searchPlaceholder: "Search branches..."
      }
    });
  }

  if ($('#departmentsTable').length) {
    $('#departmentsTable').DataTable({
      pageLength: 5,
      ordering: true,
      info: false,
      lengthChange: false,
      language: {
        searchPlaceholder: "Search departments..."
      }
    });
  }

  if ($('#assetsTable').length) {
    $('#assetsTable').DataTable({
      pageLength: 10,
      ordering: true,
      info: true,
      language: {
        searchPlaceholder: "Search assets..."
      }
    });
  }

  if ($('#stockTable').length) {
    $('#stockTable').DataTable({
      pageLength: 10,
      ordering: true,
      info: true,
      language: {
        searchPlaceholder: "Search stock..."
      }
    });
  }

  let assetIdToScrap = null;
  const scrapModalEl = document.getElementById('scrapModal');
  let scrapModal = null;
  if (scrapModalEl) {
    scrapModal = new bootstrap.Modal(scrapModalEl);
  }

  $('.scrap-btn').on('click', function() {
    assetIdToScrap = $(this).data('id');
    const uniqueId = $(this).data('unique');
    $('#scrapAssetUniqueId').text(uniqueId);
    $('#scrapReason').val('');
    if (scrapModal) {
      scrapModal.show();
    }
  });

  $('#confirmScrapBtn').on('click', function() {
    const reason = $('#scrapReason').val().trim();
    if (!reason) {
      alert('Please provide a reason for scrapping the asset.');
      return;
    }

    if (!assetIdToScrap) return;

    $.ajax({
      url: '/assets/scrap',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        AssetId: assetIdToScrap,
        ScrapReason: reason
      }),
      success: function(response) {
        if (response.success) {
          if (scrapModal) {
            scrapModal.hide();
          }
          window.location.reload();
        } else {
          alert('Error: ' + response.error);
        }
      },
      error: function(err) {
        console.error(err);
        alert('An error occurred while scrapping the asset.');
      }
    });
  });
  if ($('#returnReasonsTable').length) {
    $('#returnReasonsTable').DataTable({
      pageLength: 5,
      ordering: true,
      info: false,
      lengthChange: false,
      language: {
        searchPlaceholder: "Search reasons..."
      }
    });
  }
});
