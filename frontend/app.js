// Backend API Üssü (Lokal Test Adresi)
const API_BASE_URL = 'http://localhost:8000';

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
        const response = await fetch(`${API_BASE_URL}/api/nlp/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: textInput })
        });

        const data = await response.json();

        if (response.ok) {
            // Gelen sonucu doktorun okuyacağı şık bir rapora çevirelim
            resultBox.innerHTML = `<strong> Analiz Sonucu:</strong>\n${data.prediction}`;
        } else {
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
            // Sonucu renkli ve okunaklı basalım
            const confidencePercent = (data.confidence * 100).toFixed(2);
            resultBox.innerHTML = `<strong> Teşhis Durumu:</strong> ${data.prediction}\n<strong> Güven Skoru:</strong> %${confidencePercent}`;
        } else {
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