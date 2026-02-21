import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter, Redirect } from "expo-router";

export default function Login() {
  // 🔒 منع صفحة تسجيل الدخول على الويب
  if (Platform.OS === "web") {
    return <Redirect href="/" />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("تنبيه", "يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch (error: any) {
      Alert.alert("خطأ", error.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        نظام إدارة الصيانة
      </Text>

      <TextInput
        placeholder="البريد الإلكتروني"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 15,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="كلمة المرور"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: "#2563eb",
          padding: 15,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          تسجيل الدخول
        </Text>
      </TouchableOpacity>
    </View>
  );
}
