let apiConfig;
let lastRequestTime = 0;
let currentAudioURL = null;

const API_CONFIG = {
    'workers-api': {
        url: 'https://worker-tts.api.zwei.de.eu.org/tts'
    },
    'deno-api': {
        url: 'https://deno-tts.api.zwei.de.eu.org/tts'
    }
};

function loadSpeakers() {
    return $.ajax({
        url: 'speakers.json',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            apiConfig = data;
            updateSpeakerOptions('workers-api');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error(`加载讲述者失败：${textStatus} - ${errorThrown}`);
            showError('加载讲述者失败，请刷新页面重试。');
        }
    });
}

function updateSpeakerOptions(apiName) {
    const speakers = apiConfig[apiName].speakers;
    const speakerSelect = $('#speaker');
    speakerSelect.empty();
    
    Object.entries(speakers).forEach(([key, value]) => {
        speakerSelect.append(new Option(value, key));
    });
}

function updateSliderLabel(sliderId, labelId) {
    const slider = $(`#${sliderId}`);
    const label = $(`#${labelId}`);
    label.text(slider.val());
    
    slider.off('input').on('input', function() {
        label.text(this.value);
    });
}

$(document).ready(function() {
    loadSpeakers().then(() => {
        $('#apiTips').text('使用 Workers API，每天限制 100000 次请求');

        $('[data-toggle="tooltip"]').tooltip();

        $('#api').on('change', function() {
            const apiName = $(this).val();
            updateSpeakerOptions(apiName);
            
            $('#rate, #pitch').val(0);
            updateSliderLabel('rate', 'rateValue');
            updateSliderLabel('pitch', 'pitchValue');
            
            const tips = {
                'workers-api': '使用 Workers API，每天限制 100000 次请求',
                'deno-api': '使用 Deno API，基于 Lobe-TTS，暂不支持语速语调调整'
            };
            $('#apiTips').text(tips[apiName] || '');
        });

        updateSliderLabel('rate', 'rateValue');
        updateSliderLabel('pitch', 'pitchValue');

        $('#generateButton').on('click', function() {
            if (canMakeRequest()) {
                generateVoice(false);
            } else {
                showError('请稍候再试，每3秒只能请求一次。');
            }
        });

        $('#previewButton').on('click', function() {
            if (canMakeRequest()) {
                generateVoice(true);
            } else {
                showError('请稍候再试，每3秒只能请求一次。');
            }
        });

        $('#text').on('input', function() {
            const currentLength = $(this).val().length;
            $('#charCount').text(`最多3600个字符，目前已输入${currentLength}个字符`);
        });

        enhanceFormInteraction();
        enhanceAudioPlayback();
    });
});

function canMakeRequest() {
    const currentTime = Date.now();
    if (currentTime - lastRequestTime >= 3000) {
        lastRequestTime = currentTime;
        return true;
    }
    return false;
}

function generateVoice(isPreview) {
    const text = $('#text').val().trim();
    if (!text) {
        showError('请输入要转换的文本');
        return;
    }
    
    const apiName = $('#api').val();
    const apiUrl = API_CONFIG[apiName].url;
    const requestText = isPreview ? text.substring(0, 20) : text;
    
    makeRequest(apiUrl, isPreview, requestText, apiName === 'deno-api');
}

const cachedAudio = new Map();

const originalMakeRequest = makeRequest;
makeRequest = async function(url, isPreview, text, isDenoApi) {
    $('#loading').addClass('show').css('display', 'block');
    try {
        return await originalMakeRequest(url, isPreview, text, isDenoApi);
    } finally {
        $('#loading').removeClass('show').fadeOut(300);
    }
};

function showError(message) {
    showMessage(message, 'danger');
}

function addHistoryItem(timestamp, text, audioURL) {
    const MAX_HISTORY = 50;
    const historyItems = $('#historyItems');
    
    if (historyItems.children().length >= MAX_HISTORY) {
        const oldestItem = historyItems.children().last();
        const oldUrl = oldestItem.find('button').first().attr('onclick').match(/'([^']+)'/)[1];
        
        for (let [key, value] of cachedAudio.entries()) {
            if (value === oldUrl) {
                cachedAudio.delete(key);
                break;
            }
        }
        
        URL.revokeObjectURL(oldUrl);
        oldestItem.remove();
    }
    const historyItem = $(`
        <div class="history-item list-group-item" style="opacity: 0;">
            <div class="d-flex justify-content-between align-items-center">
                <span class="text-truncate" style="max-width: 60%;">${timestamp} - ${text}</span>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" onclick="playAudio('${audioURL}')">
                        播放
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="downloadAudio('${audioURL}')">
                        下载
                    </button>
                </div>
            </div>
        </div>
    `);
    
    $('#historyItems').prepend(historyItem);
    setTimeout(() => historyItem.animate({ opacity: 1 }, 300), 50);
}

function playAudio(audioURL) {
    const audioElement = $('#audio')[0];
    audioElement.onerror = function() {
        showError('音频播放失败，请重试');
    };
    audioElement.src = audioURL;
    audioElement.load();
    audioElement.play().catch(error => {
        console.error('播放失败:', error);
        showError('音频播放失败，请重试');
    });
}

function downloadAudio(audioURL) {
    const link = document.createElement('a');
    link.href = audioURL;
    link.download = 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearHistory() {
    $('#historyItems .history-item').each(function() {
        const audioURL = $(this).find('button').first().attr('onclick').match(/'([^']+)'/)[1];
        
        for (let [key, value] of cachedAudio.entries()) {
            if (value === audioURL) {
                cachedAudio.delete(key);
            }
        }
        URL.revokeObjectURL(audioURL);
    });
    
    $('#historyItems').empty();
    alert("历史记录已清除！");
}

function initializeAudioPlayer() {
    const audio = document.getElementById('audio');
    audio.style.borderRadius = '12px';
    audio.style.width = '100%';
    audio.style.marginTop = '20px';
}

function showMessage(message, type = 'error') {
    const errorDiv = $('#error');
    errorDiv.removeClass('alert-danger alert-warning alert-info')
           .addClass(`alert-${type}`)
           .text(message)
           .show();
    
    setTimeout(() => {
        errorDiv.fadeOut();
    }, 3000);
}

// 全局变量用于存储当前高亮的定时器
let currentHighlightTimer;

function highlightHistoryItem(audioURL) {
    // 清除当前正在进行的高亮和定时器
    if (currentHighlightTimer) {
        clearTimeout(currentHighlightTimer);
    }
    $('.history-item').removeClass('highlight-history');
    
    // 找到匹配的历史记录
    const historyItem = $('#historyItems .history-item').filter(function() {
        const onclickAttr = $(this).find('button').first().attr('onclick');
        return onclickAttr && onclickAttr.includes(audioURL);
    });
    
    if (historyItem.length) {
        try {
            // 强制重新触发动画
            void historyItem[0].offsetHeight;
            
            // 添加高亮类
            historyItem.addClass('highlight-history');
            
            // 滚动到高亮项（添加错误处理）
            try {
                historyItem[0].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center'
                });
            } catch (scrollError) {
                console.warn('Smooth scroll failed, falling back to default:', scrollError);
                historyItem[0].scrollIntoView();
            }
            
            // 设置新的定时器并保存引用
            currentHighlightTimer = setTimeout(() => {
                historyItem.removeClass('highlight-history');
                currentHighlightTimer = null;
            }, 3000);
            
        } catch (error) {
            console.error('Highlight animation failed:', error);
            // 确保在出错时移除高亮状态
            historyItem.removeClass('highlight-history');
        }
    }
}

// 优化表单响应
function enhanceFormInteraction() {
    const $form = $('#text2voice-form');
    
    // 防止表单默认提交行为
    $form.on('submit', function(e) {
        e.preventDefault();
    });
    
    // 添加输入防抖
    let inputTimeout;
    $form.find('#text').on('input', function() {
        clearTimeout(inputTimeout);
        const $this = $(this);
        
        inputTimeout = setTimeout(() => {
            const currentLength = $this.val().length;
            $('#charCount')
                .text(`最多3600个字符，目前已输入${currentLength}个字符`)
                .toggleClass('text-danger', currentLength > 3500);
        }, 200);
    });
}

// 优化音频播放体验
function enhanceAudioPlayback() {
    const audio = $('#audio')[0];
    
    audio.addEventListener('play', () => {
        $('.history-item').removeClass('playing');
        const currentUrl = audio.src;
        $(`.history-item button[onclick*="${currentUrl}"]`)
            .closest('.history-item')
            .addClass('playing');
    });

    audio.addEventListener('ended', () => {
        $('.history-item').removeClass('playing');
    });
}

function makeRequest(apiUrl, isPreview, text, isDenoApi) {
    if (!canMakeRequest()) {
        showError('请等待3秒后再试');
        return;
    }

    const speaker = $('#speaker').val();
    const rate = parseInt($('#rate').val());
    const pitch = parseInt($('#pitch').val());

    // 显示加载状态
    $('#loading').show();
    $('#error').hide();
    
    // 如果是预览，禁用预览按钮
    if (isPreview) {
        $('#previewButton').prop('disabled', true);
    } else {
        $('#generateButton').prop('disabled', true);
    }

    // 准备请求数据
    const requestData = {
        text: text,
        speaker: speaker,
        rate: rate,
        pitch: pitch
    };

    // 发送请求
    $.ajax({
        url: apiUrl,
        method: 'POST',
        data: JSON.stringify(requestData),
        contentType: 'application/json',
        success: function(response) {
            if (response && response.audio) {
                const audioUrl = response.audio;
                
                // 更新音频播放器
                const audio = $('#audio')[0];
                audio.src = audioUrl;
                
                // 显示结果区域
                $('#result').show();
                
                // 如果不是预览，添加到历史记录
                if (!isPreview) {
                    addToHistory(text, speaker, rate, pitch, audioUrl);
                }
                
                // 自动播放
                audio.play();
            } else {
                showError('生成失败，请重试');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            showError(`生成失败：${textStatus} - ${errorThrown}`);
        },
        complete: function() {
            // 隐藏加载状态
            $('#loading').hide();
            
            // 恢复按钮状态
            if (isPreview) {
                $('#previewButton').prop('disabled', false);
            } else {
                $('#generateButton').prop('disabled', false);
            }
        }
    });
}
