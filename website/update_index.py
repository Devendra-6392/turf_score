import sys

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
script_idx = -1

for i, line in enumerate(lines):
    if '<!-- Booking Wrapper -->' in line:
        start_idx = i
    if '<!-- /Booking Wrapper -->' in line:
        end_idx = i
    if '<script src="assets/js/script.js"></script>' in line:
        script_idx = i

if start_idx != -1 and end_idx != -1 and script_idx != -1:
    new_wrapper = """                <!-- Booking Wrapper -->
                <div class="booking-wrapper-two" id="dynamic-booking-wrapper">
                    <div class="text-center w-100 py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading Turfs...</span>
                        </div>
                    </div>
                </div>
                <!-- /Booking Wrapper -->\n"""
    
    # modify bottom up to not mess up indices
    lines.insert(script_idx, '    <script src="assets/js/api.js"></script>\n')
    
    # replace wrapper
    lines = lines[:start_idx] + [new_wrapper] + lines[end_idx+1:]
    
    with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('Successfully updated index.html')
else:
    print('Failed to find markers:', start_idx, end_idx, script_idx)
