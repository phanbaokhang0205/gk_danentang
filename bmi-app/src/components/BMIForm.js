import React, { useState } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { Camera, CameraResultType } from "@capacitor/camera";
import { FaWeight, FaRulerVertical, FaCalculator, FaShareAlt, FaCamera } from "react-icons/fa";

export default function BMIForm() {
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState("");
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState("");

    const calculateBMI = () => {
        const weightValue = parseFloat(weight);
        const heightValue = parseFloat(height);

        // Kiểm tra nhập liệu hợp lệ
        if (!weight || !height) {
            setError("Vui lòng nhập đủ thông tin!");
            return;
        }
        if (isNaN(weightValue) || isNaN(heightValue)) {
            setError("Vui lòng nhập số hợp lệ!");
            return;
        }
        if (weightValue <= 0 || heightValue <= 0) {
            setError("Cân nặng và chiều cao phải lớn hơn 0!");
            return;
        }
        if (heightValue < 50 || heightValue > 250) {
            setError("Chiều cao phải nằm trong khoảng 50cm - 250cm!");
            return;
        }
        if (weightValue < 10 || weightValue > 300) {
            setError("Cân nặng phải nằm trong khoảng 10kg - 300kg!");
            return;
        }

        setError(""); // Xóa lỗi nếu dữ liệu hợp lệ
        const heightInMeters = heightValue / 100;
        const bmiValue = (weightValue / (heightInMeters * heightInMeters)).toFixed(1);

        let categoryLabel = "Bình thường";
        if (bmiValue < 18.5) categoryLabel = "Gầy";
        else if (bmiValue >= 25 && bmiValue < 30) categoryLabel = "Thừa cân";
        else if (bmiValue >= 30) categoryLabel = "Béo phì";

        setBmi(bmiValue);
        setCategory(categoryLabel);

        showNotification(bmiValue, categoryLabel);
    };

    const showNotification = async (bmiValue, categoryLabel) => {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: "Kết quả BMI",
                    body: `Chỉ số BMI của bạn là ${bmiValue} (${categoryLabel})`,
                    id: 1,
                    schedule: { at: new Date(Date.now() + 1000) },
                },
            ],
        });
    };

    const shareBMI = async () => {
        if (!bmi) return;
        await Share.share({
            title: "Kết quả BMI",
            text: `Chỉ số BMI của tôi là ${bmi} (${category})`,
        });
    };

    const takePhoto = async () => {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.DataUrl,
        });
        setPhoto(image.dataUrl);
    };

    return (
        <div className="container">
            <h1>📊 Tính BMI</h1>

            {error && <p className="error">{error}</p>}

            <div className="input-group">
                <FaWeight className="icon" />
                <input
                    type="number"
                    placeholder="Nhập cân nặng (kg)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                />
            </div>

            <div className="input-group">
                <FaRulerVertical className="icon" />
                <input
                    type="number"
                    placeholder="Nhập chiều cao (cm)"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                />
            </div>

            <button onClick={calculateBMI} className="btn-calculate">
                <FaCalculator /> Tính BMI
            </button>

            {bmi && (
                <div className="result">
                    <p>📊 Chỉ số BMI: <b>{bmi}</b></p>
                    <p>📌 Đánh giá: <b>{category}</b></p>
                    <button onClick={shareBMI} className="btn-share">
                        <FaShareAlt /> Chia sẻ kết quả
                    </button>
                </div>
            )}

            <button onClick={takePhoto} className="btn-camera">
                <FaCamera /> Chụp ảnh
            </button>
            {photo && <img src={photo} alt="User" className="photo" />}
        </div>
    );
}
