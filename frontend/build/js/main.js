// Main JavaScript for CampusCare

// Auto-hide alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
});

// Confirm before deleting
function confirmDelete(message) {
    return confirm(message || 'Are you sure you want to delete this item?');
}

// Format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Status color helper
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Pending':
            return 'badge bg-warning';
        case 'In Progress':
            return 'badge bg-info';
        case 'Resolved':
            return 'badge bg-success';
        default:
            return 'badge bg-secondary';
    }
}

// Priority color helper
function getPriorityBadgeClass(priority) {
    switch(priority) {
        case 'High':
            return 'badge bg-danger';
        case 'Medium':
            return 'badge bg-warning';
        case 'Low':
            return 'badge bg-success';
        default:
            return 'badge bg-secondary';
    }
}

// Image preview before upload
function previewImage(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
            document.getElementById(previewId).style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}