// Backend API Üssü (Lokal Test Adresi)
const API_BASE_URL = 'http://13.48.248.199:8000';

//  1. TIBBİ METİN ANALİZİ (BIO-NLP)
async function analyzeText() {
    const textInput = document.getElementById('nlpInput').value;
    const resultBox = document.getElementById('nlpResult');
    const btn = document.getElementById('btnNlp');

    if (!textInput.trim()) {
        alert('Lütfen analiz edilecek bir klinik metin girin!');
        return;
    }

    // Arayüzü yükleniyor moduna alalım
    btn.disabled = true;
    btn.innerText = 'Model analiz ediyor... ';
    resultBox.innerHTML = 'Yapay zeka modeli metni inceliyor, lütfen bekleyin...';

    try {
        // Veriyi gövdede (body) değil, Python'ın beklediği gibi URL parametresi olarak gönderiyoruz
        const response = await fetch(`${API_BASE_URL}/api/nlp/analyze?text=${encodeURIComponent(textInput)}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Gelen tıbbi terim listesini ekrana şık bir şekilde basıyoruz
            if (data.entities && data.entities.length > 0) {
                let htmlContent = `<strong> Tespit Edilen Tıbbi Varlıklar:</strong><br><ul style="margin-top: 5px; padding-left: 20px;">`;
                data.entities.forEach(item => {
                    let word = item.word || item.entity;
                    let group = item.entity_group || 'Terim';
                    htmlContent += `<li><span style="color: #2e7d32; font-weight: bold;">${word}</span> - <small style="background: #e8f5e9; padding: 2px 6px; border-radius: 4px;">${group}</small></li>`;
                });
                htmlContent += `</ul>`;
                resultBox.innerHTML = htmlContent;
            } else {
                resultBox.innerHTML = `<strong> Analiz Sonucu:</strong><br>Herhangi bir tıbbi varlık tespit edilemedi.`;
            }
        }
        else {
            resultBox.innerHTML = ` Hata Oluştu: ${data.detail || 'Bilinmeyen hata'}`;
        }
    } catch (error) {
        resultBox.innerHTML = 'Sunucuya bağlanılamadı. Backend çalışıyor mu kontrol ediniz.';
        console.error(error);
    } finally {
        // Butonu eski haline getirelim
        btn.disabled = false;
        btn.innerText = 'Metni Analiz Et';
    }
}

//  2. MRI GÖRSEL ANALİZİ (TENSORFLOW)
async function analyzeMri() {
    const fileInput = document.getElementById('mriInput');
    const resultBox = document.getElementById('mriResult');
    const btn = document.getElementById('btnMri');

    if (fileInput.files.length === 0) {
        alert('Lütfen analiz için bir MRI görseli seçin!');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Arayüzü yükleniyor moduna alalım
    btn.disabled = true;
    btn.innerText = 'Görsel Taranıyor... ';
    resultBox.innerHTML = 'Tümör tespiti yapılıyor, lütfen bekleyin...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/mri/analyze`, {
            method: 'POST',
            body: formData // Dosya gönderirken Content-Type header'ı eklenmez, tarayıcı otomatik ayarlar
        });

        const data = await response.json();

        if (response.ok) {
            // Python'dan dönen "analysis" objesinin altındaki verilere eriştik
            const prediction = data.analysis.prediction;
            const confidencePercent = (data.analysis.confidence * 100).toFixed(2);
            resultBox.innerHTML = `<strong> Teşhis Durumu:</strong> ${prediction}<br><strong> Güven Skoru:</strong> %${confidencePercent}`;
        }else {
            resultBox.innerHTML = ` Hata Oluştu: ${data.detail || 'Bilinmeyen hata'}`;
        }
    } catch (error) {
        resultBox.innerHTML = ' Sunucuya bağlanılamadı. Backend çalışıyor mu kontrol ediniz.';
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.innerText = 'MRI Görselini Tara';
    }
}