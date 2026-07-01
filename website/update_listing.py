import sys

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\listing-grid.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<!-- Listing Content -->' in line:
        start_idx = i
    if '<!-- /Listing Content -->' in line:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    # Replace lines between start and end
    new_lines = lines[:start_idx + 1]
    new_lines.append('				<div class="row justify-content-center" id="turf-grid-container">\n')
    new_lines.append('					<div class="text-center w-100 py-5"><h4>Loading Turfs...</h4></div>\n')
    new_lines.append('				</div>\n')
    new_lines.extend(lines[end_idx:])
    
    html = ''.join(new_lines)
    
    # Add api.js
    script_tag = '<script src="assets/js/api.js"></script>'
    html = html.replace('<!-- Custom JS -->', f'{script_tag}\n\t<!-- Custom JS -->')
    
    inline_script = """
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const container = document.getElementById('turf-grid-container');
            if (!container) return;
            
            try {
                const turfs = await getTurfs();
                
                if (!turfs || turfs.length === 0) {
                    container.innerHTML = '<div class="text-center w-100 py-5"><h4>No Turfs Found</h4></div>';
                    return;
                }
                
                let html = '';
                turfs.forEach(turf => {
                    const price = turf.pricePerHour || turf.price || '1000';
                    const name = turf.name || 'Turf Arena';
                    const location = turf.location || turf.city || 'Unknown Location';
                    const id = turf.id;
                    const sportType = (turf.sportTypes && turf.sportTypes.length > 0) ? turf.sportTypes[0] : 'Football';
                    
                    html += `
                        <div class="col-lg-4 col-md-6">
                            <div class="wrapper">
                                <div class="listing-item listing-item-grid">                                        
                                    <div class="listing-img">
                                        <a href="venue-details.html?id=${id}">
                                            <img src="assets/img/venues/venues-01.jpg" alt="Venue">
                                        </a>
                                        <div class="fav-item-venues">
                                            <span class="tag tag-blue">${sportType}</span>       
                                            <h5 class="tag tag-primary">₹${price}<span>/hr</span></h5>
                                        </div>
                                    </div>                                      
                                    <div class="listing-content">
                                        <div class="list-reviews">                          
                                            <div class="d-flex align-items-center">
                                                <span class="rating-bg">${turf.rating || '4.5'}</span><span>Reviews</span> 
                                            </div>
                                        </div>  
                                        <h3 class="listing-title">
                                            <a href="venue-details.html?id=${id}">${name}</a>
                                        </h3>
                                        <div class="listing-details-group">
                                            <p>${turf.description ? turf.description.substring(0, 80) + '...' : 'Best turf in town.'}</p>
                                            <ul>
                                                <li>
                                                    <span>
                                                        <i class="feather-map-pin"></i>${location}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="listing-button">
                                            <a href="venue-details.html?id=${id}" class="user-book-now"><span>Book Now</span></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                container.innerHTML = html;
                
            } catch (err) {
                container.innerHTML = `<div class="text-center w-100 py-5 text-danger"><h4>Error loading turfs</h4><p>${err.message}</p></div>`;
            }
        });
    </script>
    """
    html = html.replace('</body>', f'{inline_script}\n</body>')
    
    with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\listing-grid.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Updated listing-grid.html using lines')
else:
    print('Markers not found', start_idx, end_idx)
