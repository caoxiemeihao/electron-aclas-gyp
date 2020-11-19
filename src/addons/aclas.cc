#include <windows.h>
#include <iostream>
#include <napi.h>
using namespace std;

BOOL is_ran = false; // 判断是否有给调用处反馈
BOOL g_debug = true; // 打印 debug 信息
char g_extra[240];   // 外部传入的一些信息

// 通过 stdout 的方式将数据推给 node.js
void Stdout2Nodejs(INT32 code, INT32 index, INT32 total)
{
	std::cout << "##dispatch={"
		<< "\"code\":" << code
		<< ","
		<< "\"index\":" << index
		<< ","
		<< "\"total\":" << total
		<< ","
		<< "\"extra\":"
		<< "\"" << g_extra << "\""
		<< "}##" << std::endl;
	is_ran = true;
}

void DebugLog(char* log) {
	if (!g_debug) return;

	cout << "debug: " << log << endl;
}

// ================================================================================
struct DviIn
{
	UINT32 ProtocolType;
	UINT32  Addr;
	UINT32  Port;
	UCHAR    name[16];
	UINT32  ID;
	UINT32  Version;
	BYTE     Country;
	BYTE     DepartmentID;
	BYTE     KeyType;
	UINT64  PrinterDot;
	LONG64   PrnStartDate;
	UINT32  LabelPage;
	UINT32  PrinterNo;
	USHORT   PLUStorage;
	USHORT   HotKeyCount;
	USHORT   NutritionStorage;
	USHORT   DiscountStorage;
	USHORT   Note1Storage;
	USHORT   Note2Storage;
	USHORT   Note3Storage;
	USHORT   Note4Storage;
	BYTE     stroge[177];
};

extern "C"
{
	typedef bool (CALLBACK*pAclasSDKInitialize)(char *s);
	typedef bool (CALLBACK*pGetDevicesInfo)(UINT32  Addr, UINT32  Port, UINT32 ProtocolType, DviIn *info);

	typedef void (WINAPI *FP)(UINT32 Eorrorcode, UINT32 index, UINT32 Total, char *userdata);

	typedef HANDLE(CALLBACK*pAclasSDKExecTask)(UINT32 Addr, UINT32  Port, UINT32 ProtocolType, UINT32 ProceType, UINT32 DataType, char *FileName, FP fp, char *uerdata);
	typedef HANDLE(CALLBACK*pAclasSDKWaitForTask)(HANDLE handle);

	typedef int (CALLBACK*pAclasSDKSyncExecTask)(char *Addr, UINT32  Port, UINT32 ProtocolType, UINT32 ProceType, UINT32 DataType, char *FileName);
}

void WINAPI ongress(UINT32 Eorrorcode, UINT32 index, UINT32 Total, char *userdata)
{

	Stdout2Nodejs(Eorrorcode, index, Total);

	switch (Eorrorcode)
	{
	case 0x0000:
		// cout << "complete" << endl;
		break;
	case 0x0001:
		// cout << index << "/" << Total << endl;
		break;
	}
}
UINT MakehostToDword(char *host)
{
	UINT result;
	UINT a[4];
	char *p1 = NULL;

	char str[20];
	strcpy(str, host);
	p1 = strtok(str, ".");
	a[0] = atoi(p1);
	result = a[0] << 24;
	for (int i = 1; i < 4; i++)
	{
		p1 = strtok(NULL, ".");
		a[i] = atoi(p1);
		result += a[i] << ((3 - i) * 8);
	}
	return result;


}
// ================================================================================


void Start(char* host, UINT32 proceType, char* filename, char* dll = "AclasSDK.dll") {
	char type[10];

	DebugLog(host);
	DebugLog(itoa(proceType, type, 10));
	DebugLog(filename);
	DebugLog(dll);

	HMODULE hModule = LoadLibrary(TEXT(dll));

	if (!hModule) {
		Stdout2Nodejs(404, 0, 0);
		DebugLog("LoadLibrary failed.");
		DebugLog((char*)hModule);
		return;
	}

	// Initialize
	pAclasSDKInitialize Initialize = (pAclasSDKInitialize)GetProcAddress(hModule, "AclasSDK_Initialize");
	if (Initialize(NULL)) {
		DebugLog("Initialize success.");
	}
	else 
	{
		DebugLog("Initialize failed.");
		return;
	}

	// Get Device Information
	pGetDevicesInfo getDevicesInfo = (pGetDevicesInfo)GetProcAddress(hModule, "AclasSDK_GetDevicesInfo");
	struct DviIn* info = (struct DviIn*)malloc(sizeof(struct DviIn));
	UINT addr = MakehostToDword(host);
	BOOL ref = getDevicesInfo(addr, 0, 0, info);

	DebugLog((char*)info->name);

	// Function Pointer (ongress 指针函数定义)
	FP fp = ongress;
	char *userdata = NULL;

	// ASync call
	pAclasSDKExecTask exectask = (pAclasSDKExecTask)GetProcAddress(hModule, "AclasSDK_ExecTaskA");
	pAclasSDKWaitForTask waitfortask = (pAclasSDKWaitForTask)GetProcAddress(hModule, "AclasSDK_WaitForTask");
	HANDLE handle = waitfortask(exectask(addr, 5002, info->ProtocolType, 0, 0x0000, filename, fp, userdata));

	if (!is_ran) { Stdout2Nodejs(403, 0, 0); } // 链接超时.
	is_ran = false;

	// 释放资源
	GetProcAddress(hModule, "AclasSDK_Finalize");
}

void RunCallback(const Napi::CallbackInfo &info) {
	DebugLog("==== [gyp] run sdk ===");

	Napi::Env env = info.Env();
	Napi::Object config = info[0].As<Napi::Object>();
	Napi::Function callback = info[1].As<Napi::Function>();

	// js 入参
	Napi::Value n_host = config["host"];
	Napi::Value n_type = config["type"];
	Napi::Value n_filename = config["filename"];
	Napi::Value n_dll_path = config["dll_path"];
	Napi::Value n_extra = config["extra"];
	Napi::Value n_debug = config["debug"];

	// C++ 对应 js 入参
	char host[100];
	UINT32 proceType;
	char filename[200];
	char dll_path[200];

	// 转换 js 入参
	napi_get_value_string_utf8(env, n_host, host, sizeof(host), NULL);
	napi_get_value_uint32(env, n_type, &proceType);
	napi_get_value_string_utf8(env, n_filename, filename, sizeof(filename), NULL);
	napi_get_value_string_utf8(env, n_dll_path, dll_path, sizeof(dll_path), NULL);

	if (!n_debug.IsUndefined()) g_debug = n_debug.ToBoolean();
	if (!n_extra.IsUndefined()) napi_get_value_string_utf8(env, n_extra, g_extra, sizeof(g_extra), NULL);

	Start(host, proceType, filename, dll_path);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	return Napi::Function::New(env, RunCallback);
}

NODE_API_MODULE(aclas, Init)
