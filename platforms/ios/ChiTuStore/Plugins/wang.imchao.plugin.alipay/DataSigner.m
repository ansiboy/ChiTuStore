//
//  DataSigner.m
//  AlixPayDemo
//
//  Created by Jing Wen on 8/2/11.
//  Copyright 2011 alipay.com. All rights reserved.
//

#import "DataSigner.h"
#import "RSADataSigner.h"

id<DataSigner> CreateRSADataSigner(NSString *privateKey) {
	
	return [[RSADataSigner alloc] initWithPrivateKey:privateKey];
	
}
