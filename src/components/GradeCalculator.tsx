import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface GradeCalculatorProps {
  visible: boolean;
  onClose: () => void;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({ visible, onClose }) => {
  const [calcValues, setCalcValues] = useState({ srtek11: '', srtek22: '', rk1: '', rk2: '', exam: '' });
  const [calcResult, setCalcResult] = useState<number | null>(null);

  function calcFinal() {
    const s1 = Number(calcValues.srtek11) || 0;
    const s2 = Number(calcValues.srtek22) || 0;
    const r1 = Number(calcValues.rk1) || 0;
    const r2 = Number(calcValues.rk2) || 0;
    const ex = Number(calcValues.exam) || 0;
    const current = (s1 + s2 + r1 + r2) / 4;
    const final = current * 0.6 + ex * 0.4;
    setCalcResult(Math.round(final * 100) / 100);
    Keyboard.dismiss();
  }

  function getGradeLabel(score: number) {
    if (score >= 95) return 'A (Отлично, 4.0)';
    if (score >= 90) return 'A- (Отлично, 3.67)';
    if (score >= 85) return 'B+ (Хорошо, 3.33)';
    if (score >= 80) return 'B (Хорошо, 3.0)';
    if (score >= 75) return 'B- (Хорошо, 2.67)';
    if (score >= 70) return 'C+ (Удовлетворительно, 2.33)';
    if (score >= 65) return 'C (Удовлетворительно, 2.0)';
    if (score >= 60) return 'C- (Удовлетворительно, 1.67)';
    if (score >= 55) return 'D+ (Плохо, 1.33)';
    if (score >= 50) return 'D (Плохо, 1.0)';
    return 'F (Неудовлетворительно, 0.0)';
  }

  function resetCalculator() {
    setCalcValues({ srtek11: '', srtek22: '', rk1: '', rk2: '', exam: '' });
    setCalcResult(null);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-40`}>
        <View style={tw`bg-white p-6 rounded-2xl w-80 shadow-lg`}>
          <Text style={tw`text-lg font-bold mb-3 text-center text-gray-700`}>Калькулятор итоговой оценки</Text>
          <TouchableOpacity style={tw`bg-[#F3B3D3] py-3 rounded-lg items-center mb-3 shadow`} onPress={calcFinal}>
            <Text style={tw`text-black font-bold text-base`}>Рассчитать</Text>
          </TouchableOpacity>
          <View style={tw`flex-row mb-2`}>
            <TextInput
              style={tw`flex-1 border border-gray-300 p-3 rounded-lg bg-white mr-2 text-base text-gray-700`}
              placeholder="Ср. тек 1"
              keyboardType="numeric"
              value={calcValues.srtek11}
              onChangeText={v => setCalcValues(cv => ({ ...cv, srtek11: v }))}
              placeholderTextColor="#64748B"
            />
            <TextInput
              style={tw`flex-1 border border-gray-300 p-3 rounded-lg bg-white text-base text-gray-700`}
              placeholder="Ср. тек 2"
              keyboardType="numeric"
              value={calcValues.srtek22}
              onChangeText={v => setCalcValues(cv => ({ ...cv, srtek22: v }))}
              placeholderTextColor="#64748B"
            />
          </View>
          <View style={tw`flex-row mb-2`}>
            <TextInput
              style={tw`flex-1 border border-gray-300 p-3 rounded-lg bg-white mr-2 text-base text-gray-700`}
              placeholder="РК1"
              keyboardType="numeric"
              value={calcValues.rk1}
              onChangeText={v => setCalcValues(cv => ({ ...cv, rk1: v }))}
              placeholderTextColor="#64748B"
            />
            <TextInput
              style={tw`flex-1 border border-gray-300 p-3 rounded-lg bg-white text-base text-gray-700`}
              placeholder="РК2"
              keyboardType="numeric"
              value={calcValues.rk2}
              onChangeText={v => setCalcValues(cv => ({ ...cv, rk2: v }))}
              placeholderTextColor="#64748B"
            />
          </View>
          <View style={tw`mb-4`}>
            <TextInput
              style={tw`border border-gray-300 p-3 rounded-lg bg-white text-base text-gray-700`}
              placeholder="Экзамен"
              keyboardType="numeric"
              value={calcValues.exam}
              onChangeText={v => setCalcValues(cv => ({ ...cv, exam: v }))}
              placeholderTextColor="#64748B"
            />
          </View>
          {calcResult !== null && (
            <View style={tw`mb-3 items-center bg-green-100 rounded-lg px-4 py-2`}>
              <Text style={tw`text-base font-bold mb-1 text-green-800`}>Итоговая: <Text style={tw`text-xl text-green-700`}>{calcResult}</Text></Text>
              <Text style={tw`text-xs text-gray-700`}>{getGradeLabel(calcResult)}</Text>
            </View>
          )}
          <TouchableOpacity style={tw`bg-white py-2 rounded-lg items-center`} onPress={() => { resetCalculator(); onClose(); }}>
            <Text style={tw`font-bold text-base text-gray-700`}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GradeCalculator; 